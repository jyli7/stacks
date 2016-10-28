angular.module('stacksApp', ['ionic', 'stacksApp.controllers', 'stacksApp.filters', 'ionic.cloud',
  'stacksApp.services', 'ui.router', 'firebase', 'ionic.contrib.ui.tinderCards', 'ui.gravatar'])
  .constant('FirebaseUrl', 'https://stacks703.firebaseio.com/')
  .service('rootRef', ['FirebaseUrl', Firebase])
  .run(ApplicationRun)
  .config(ApplicationConfig)
  .directive('noScroll', function() {
    return {
      restrict: 'A',
      link: function($scope, $element, $attr) {
        $element.on('touchmove', function(e) {
          e.preventDefault();
        });
      }
    }
  })
;

function ApplicationRun($ionicPlatform, $rootScope, $state, rootRef, $ionicPush) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $rootScope.$on('cloud:push:notification', function(event, data) {
      var msg = data.message;
      alert(msg.title + ': ' + msg.text);
    });

    $ionicPush.register().then(function(t) {
      $ionicPush.saveToken(t);
    }).catch(function (error) {
      console.log(error);
    });

    rootRef.onAuth(function (authData) {
      if (authData === null) {
        $state.go('login')
      } else {
        $state.go('app.cards', {}, {reload: true});
      }
    });
  });

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    if (error === 'AUTH_REQUIRED') {
      $state.go('login');
    }
  });


};

ApplicationRun.$inject = ['$ionicPlatform', '$rootScope', '$state', 'rootRef', '$ionicPush'];

function ApplicationConfig($stateProvider, $urlRouterProvider, $ionicCloudProvider, $ionicConfigProvider) {
  //$ionicConfigProvider.views.maxCache(0);

  $ionicCloudProvider.init({
    "core": {
      "app_id": "b00ca850"
    },
    "push": {
      "sender_id": "932163409078",
      "pluginConfig": {
        "ios": {
          "badge": true,
          "sound": true
        },
        "android": {
          "iconColor": "#343434"
        }
      }
    }
  });


  $stateProvider
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.cards', {
      url: '/cards',
      views: {
        'menuContent': {
          templateUrl: 'templates/cards.html',
          controller: 'CardsCtrl'
        }
      },
      resolve: {
        "currentAuth": ["Auth", function (Auth) {
          return Auth.$requireAuth();
        }],
        "cardsList": ["Cards", "Auth", function (Cards, Auth){
          return Cards.forUser(Auth.$getAuth().uid).$loaded().then(function (data) {
            return data;
          });
        }]
      }
    })

    .state('app.groups', {
      url: '/groups',
      views: {
        'menuContent': {
          templateUrl: 'templates/groups.html',
          controller: 'GroupsCtrl'
        }
      },
      resolve: {
        "currentAuth": ["Auth", function (Auth) {
          return Auth.$requireAuth();
        }]
      }
    })

    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsCtrl'
        }
      },
      resolve: {
        "currentAuth": ["Auth", function (Auth) {
          return Auth.$requireAuth();
        }]
      }
    })

    .state('login', {
      url: '/login',
      resolve: {
        // Only allow access to this page if user is NOT already signed in
        requireNotAuthed: function($state, Auth){
          return Auth.$requireAuth().then(function(auth){
            $state.go('app.cards');
          }, function(error){
            return;
          });
        }
      },
      templateUrl: 'templates/login.html',
      controller: 'AuthCtrl as ctrl'
    })

    .state('signup', {
      url: '/signup',
      resolve: {
        // Only allow access to this page if user is NOT already signed in
        requireNotAuthed: function($state, Auth){
          return Auth.$requireAuth().then(function(auth){
            $state.go('app.cards');
          }, function(error){
            return;
          });
        }
      },
      templateUrl: 'templates/signup.html',
      controller: 'AuthCtrl'
    })

    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise("#/app/cards");
};

ApplicationConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$ionicCloudProvider', '$ionicConfigProvider'];



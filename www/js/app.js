angular.module('stacksApp', ['ionic', 'stacksApp.controllers', 'stacksApp.filters', 'ionic.cloud',
  'stacksApp.services', 'ui.router', 'firebase', 'ionic.contrib.ui.tinderCards'])
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

function ApplicationRun($ionicPlatform, $rootScope, $state) {
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
  });

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    if (error === 'AUTH_REQUIRED') {
      $state.go('login');
    }
  });
};

ApplicationRun.$inject = ['$ionicPlatform', '$rootScope', '$state'];

function ApplicationConfig($stateProvider, $urlRouterProvider, $ionicCloudProvider) {

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
    .state('login', {
      url: '/login',
      resolve: {
        // Only allow access to this page if user is NOT already signed in
        requireNotAuthed: function($state, Auth){
          return Auth.$requireAuth().then(function(auth){
            $state.go('cards');
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
            $state.go('cards');
          }, function(error){
            return;
          });
        }
      },
      templateUrl: 'templates/signup.html',
      controller: 'AuthCtrl'
    })

    .state('cards', {
      url: '/cards',
      templateUrl: 'templates/cards.html',
      controller: 'CardsCtrl as ctrl',
      resolve: {
        "currentAuth": ["Auth", function (Auth) {
          return Auth.$requireAuth();
        }]
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise("/login");
};

ApplicationConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$ionicCloudProvider'];



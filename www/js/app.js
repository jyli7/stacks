angular.module('stacksApp', ['ionic', 'stacksApp.controllers', 'stacksApp.services', 'ui.router', 'firebase'])
  .constant('FirebaseUrl', 'https://stacks703.firebaseio.com/')
  .service('rootRef', ['FirebaseUrl', Firebase])
  .run(ApplicationRun)
  .config(ApplicationConfig);


function ApplicationRun($ionicPlatform, $rootScope, $state) {



  $ionicPlatform.ready(function () {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    
    var push = new Ionic.Push({
      "debug": true
    });

    push.register(function(token) {
      console.log("My Device token:",token.token);
      push.saveToken(token);  // persist the token in the Ionic Platform
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

ApplicationConfig.$inject = ['$stateProvider', '$urlRouterProvider'];



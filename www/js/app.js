angular.module('stacksApp', ['ionic', 'stacksApp.controllers', 'stacksApp.services', 'ui.router', 'firebase'])
  .constant('FirebaseUrl', 'https://stacks703.firebaseio.com/')
  .service('rootRef', ['FirebaseUrl', Firebase])
  .run(ApplicationRun)
  .config(ApplicationConfig);


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
  });

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === 'AUTH_REQUIRED') {
      $state.go('login');
    }
  });
};

ApplicationRun.$inject = ['$ionicPlatform', '$rootScope', '$state'];

function ApplicationConfig($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('login', {
      url: '/login',
      resolve: {
        requireNoAuth: function($state, AuthService){
          return AuthService.$requireAuth().then(function(auth){
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
        requireNoAuth: function($state, AuthService){
          return AuthService.$requireAuth().then(function(auth){
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
      controller: 'CardsCtrl as ctrl'
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise("/login");
};

ApplicationConfig.$inject = ['$stateProvider', '$urlRouterProvider'];



angular.module('stacksApp', ['ionic', 'stacksApp.controllers', 'ionic.cloud', 'stacksApp.services', 'ui.router', 'firebase'])
  .constant('FirebaseUrl', 'https://stacks703.firebaseio.com/')
  .service('rootRef', ['FirebaseUrl', Firebase])
  .run(ApplicationRun)
  .config(ApplicationConfig);

function onPushwooshInitialized(pushNotification) {

  //if you need push token at a later time you can always get it from Pushwoosh plugin
  pushNotification.getPushToken(
    function(token) {
      console.info('push token: ' + token);
    }
  );

  //and HWID if you want to communicate with Pushwoosh API
  pushNotification.getPushwooshHWID(
    function(token) {
      console.info('Pushwoosh HWID: ' + token);
    }
  );

  //settings tags
  pushNotification.setTags({
      tagName: "tagValue",
      intTagName: 10
    },
    function(status) {
      console.info('setTags success: ' + JSON.stringify(status));
    },
    function(status) {
      console.warn('setTags failed');
    }
  );

  pushNotification.getTags(
    function(status) {
      console.info('getTags success: ' + JSON.stringify(status));
    },
    function(status) {
      console.warn('getTags failed');
    }
  );

  //start geo tracking.
  //pushNotification.startLocationTracking();
}


function initPushwoosh() {
  var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

  //set push notifications handler
  document.addEventListener('push-notification',
    function(event) {
      var message = event.notification.message;
      var userData = event.notification.userdata;

      alert("Push message opened: " + message);
      console.info(JSON.stringify(event.notification));

      //dump custom data to the console if it exists
      if (typeof(userData) != "undefined") {
        console.warn('user data: ' + JSON.stringify(userData));
      }
    }
  );

  // Initialize Pushwoosh. This will trigger all pending push notifications on start.
  pushNotification.onDeviceReady({
    appid: "37015-2D103",
    projectid: "932163409078",
    serviceName: "MPNS_SERVICE_NAME"
  });

  //register for push notifications
  pushNotification.registerDevice(
    function(status) {
      alert("registered with token: " + status.pushToken);
      onPushwooshInitialized(pushNotification);
    },
    function(status) {
      alert("failed to register: " + status);
      console.warn(JSON.stringify(['failed to register ', status]));
    }
  );
}

function ApplicationRun($ionicPlatform, $rootScope, $state, $ionicPush) {
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

    $ionicPush.register().then(function(t) {
      return $ionicPush.saveToken(t);
    }).then(function(t) {
      console.log('Token saved:', t.token);
    });

    $rootScope.$on('cloud:push:notification', function(event, data) {
      var msg = data.message;
      alert(msg.title + ': ' + msg.text);
    });

    //initPushwoosh();

  });

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    if (error === 'AUTH_REQUIRED') {
      $state.go('login');
    }
  });
};

ApplicationRun.$inject = ['$ionicPlatform', '$rootScope', '$state', '$ionicPush'];

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



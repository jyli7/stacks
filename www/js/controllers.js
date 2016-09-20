angular.module('stacksApp.controllers', [])

  .controller('AuthCtrl', AuthCtrl)

  .controller('CardsCtrl', CardsCtrl)

  .controller('PasswordResetCtrl', PasswordResetCtrl)
  ;


function AuthCtrl(rootRef, $scope, Auth, $state, Users, $ionicPush) {

  $scope.captureDeviceToken = function (userId) {
    $ionicPush.register().then(function(t) {
      return $ionicPush.saveToken(t);
    }).then(function(t) {
      Users.addDeviceTokenToUser(userId, t.token);
    }).catch(function (error) {
      alert(error);
    });
  };

  $scope.data = {};

  $scope.loginEmail = function() {
    Auth.$authWithPassword({
      "email": $scope.data.email,
      "password": $scope.data.password
    }).then(function (authData) {
      $scope.captureDeviceToken(authData.uid);
      $state.go('cards');
    }).catch(function (error) {
      alert(error);
    });
  };

  $scope.loginWithFacebook = function () {
    Auth.loginWithFacebook();
  };

  $scope.register = function () {
    Auth.$createUser({
      email: $scope.data.email,
      password: $scope.data.password
    }).then(function (authData) {
      rootRef.child("users").child(authData.uid).set({
        email: $scope.data.email
      }).then(function () {
        $scope.loginEmail({email: $scope.data.email, password: $scope.data.password});
      });
    }).catch(function (error) {
      switch (error.code) {
        case "EMAIL_TAKEN":
          alert("Sorry, that email is already taken");
          break;
        case "INVALID_EMAIL":
          alert("Sorry, that is an invalid email address");
          break;
        default:
          alert("Error creating user:", error);
      }
    });
  };
}

AuthCtrl.$inject = ['rootRef', '$scope', 'Auth', '$state', 'Users', '$ionicPush'];

function PasswordResetCtrl($scope, Auth, $state) {
  $scope.data = {}; // Empty object to get the form data.

  /**
   * We grab our user's email from the form and send it to our service, piece of cake!
   */
  $scope.resetPassword = function(){
    var email = $scope.data.email;
    Auth.resetPassword(email);
  };
}

PasswordResetCtrl.$inject = ['$scope', 'Auth', '$state'];

function CardsCtrl ($scope, rootRef, Cards, Users, currentAuth, $state, $http) {

  $scope.cards = Cards.forUser(currentAuth.uid);

  $scope.selectedTags = [];

  $scope.newCard = {
    front: '',
    back: '',
    frontIsActive: true,
    tags: $scope.selectedTags,
    creator_id: currentAuth.uid,
    last_updated: Date.now(),
    completed: false
  };

  $scope.switchActiveSide = function (card) {
    card.frontIsActive = !card.frontIsActive;
  };

  $scope.createCard = function () {
    //var data = {
    //  "tokens": ["e1d6a237952ae682b428b175446158a201c8dfb034b42e98f2fa99f37835a557"],
    //  "profile": "jimmy",
    //  "notification": {
    //    "message": $scope.newCard.front
    //  }
    //};
    //
    //$http.defaults.headers.common['Authorization'] = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI1NGEwYTJlZi0wZjkxLTQ5MGUtYTMwYy00NzE4YTAyNzk4YmUifQ.L5Ylvt6lvJ7IYQEYHIqkWOnqNy7MYJjPA1i0UwGkWCw";
    //
    //$http.post('https://api.ionic.io/push/notifications', data).success(function(data) {
    //  alert(data);
    //}).error(function (data, status) {
    //  alert(data);
    //});
    $scope.cards.$add($scope.newCard).then(function (ref) {
      $scope.newCard.front = '';
      $scope.newCard.back = '';
      var newCardForUser = {
        $id: ref.key(),
        $value: true
      };
      Users.getCardsForUserById(currentAuth.uid).$add(newCardForUser);

    });
  };

  $scope.recycle = function (card) {
    card.last_updated = Date.now();
    $scope.cards.$save(card);
  };

  $scope.complete = function (card) {
    card.last_updated = Date.now();
    card.completed = true;
    $scope.cards.$save(card);
  };

  $scope.logout = function () {
    rootRef.unauth().then(function () {
      $state.go('login');
    });
  };

  // Tags stuff

  //$scope.tags = Tags.forUser(currentAuth.uid);
  //
  //$scope.newTag = {
  //  name: '',
  //  creator_id: currentAuth.uid
  //};
  //
  //$scope.createTag = function () {
  //  $scope.tags.$add($scope.newTag).then(function (ref) {
  //    $scope.newTag.name = '';
  //    var newTagForUser = {
  //      $id: ref.key(),
  //      $value: true
  //    };
  //    Users.getTagsForUserById(currentAuth.uid).$add(newTagForUser);
  //  });
  //}
}

CardsCtrl.$inject = ['$scope', 'rootRef', 'Cards', 'Users', 'currentAuth', '$state', '$http'];

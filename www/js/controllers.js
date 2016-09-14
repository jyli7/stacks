angular.module('stacksApp.controllers', [])

  .controller('AuthCtrl', AuthCtrl)

  .controller('CardsCtrl', CardsCtrl)

  .controller('PasswordResetCtrl', PasswordResetCtrl)

  ;


function AuthCtrl(rootRef, $scope, Auth, $state) {

  $scope.data = {};

  $scope.loginEmail = function() {
    Auth.$authWithPassword({
      "email": $scope.data.email,
      "password": $scope.data.password
    }).then(function (authData) {
      $state.go('cards');
    }).catch(function (error) {
      console.log(error);
    });
  };

  $scope.loginWithFacebook = function loginWithFacebook() {
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

AuthCtrl.$inject = ['rootRef', '$scope', 'Auth', '$state'];

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

function CardsCtrl ($scope, $rootScope, rootRef, $ionicListDelegate, Cards, currentAuth) {
  $scope.cards = Cards.forUser(currentAuth.uid);

  $scope.newCard = {
    content: '',
    creator_id: currentAuth.uid
  };

  $scope.createCard = function () {
    $scope.cards.$add($scope.newCard).then(function () {
      $scope.newCard.content = '';
    });
  };

  //$scope.completeCard = function (card) {
  //  var cardRef = new Firebase('https://stacks703.firebaseio.com/cards/' + card.$id);
  //  cardRef.child('status').set('completed');
  //  $ionicListDelegate.closeOptionButtons();
  //};
  //
  //$scope.init();
  //
  //$scope.$on("refreshCards", function () {
  //  $scope.init();
  //});
}

CardsCtrl.$inject = ['$scope', '$rootScope', 'rootRef', '$ionicListDelegate', 'Cards', 'currentAuth'];

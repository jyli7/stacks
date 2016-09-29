angular.module('stacksApp.controllers', [])

  .controller('AuthCtrl', AuthCtrl)

  .controller('CardsCtrl', CardsCtrl)

  .controller('PasswordResetCtrl', PasswordResetCtrl)
;


function AuthCtrl(rootRef, $scope, Auth, $state, Users, $ionicPush) {

  $scope.data = {};

  $scope.loginEmail = function () {
    Auth.$authWithPassword({
      "email": $scope.data.email,
      "password": $scope.data.password
    }).then(function (authData) {
      if ($ionicPush.token) {
        Users.addDeviceTokenToUser(authData.uid, $ionicPush.token["token"]);
      }
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
  $scope.resetPassword = function () {
    var email = $scope.data.email;
    Auth.resetPassword(email);
  };
}

PasswordResetCtrl.$inject = ['$scope', 'Auth', '$state'];

function CardsCtrl($scope, rootRef, Cards, Users, currentAuth, $state, $http, TDCardDelegate, Auth, cardsList) {

  $scope.cards = cardsList;

  console.log($scope.cards);

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

  $scope.zIndexCount = -2;

  $scope.recycle = function (card, scope) {
    console.log("Recycling");
    var el = scope.el;
    var rightText = el.querySelector('.yes-text');
    card.last_updated = Date.now();
    $scope.cards.$save(card).then(function () {
      setTimeout(function () {
        el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
        el.style.zIndex = $scope.zIndexCount;
        $scope.zIndexCount -= 1;
        if (rightText) {
          rightText.style.opacity = 0;
        }
      }, 500);
    });
  };

  $scope.complete = function (card) {
    console.log("Trashing....");
    card.last_updated = Date.now();
    card.completed = true;
    $scope.cards.$save(card);
  };

  $scope.logout = function () {
    $scope.cards = [];
    console.log("unauthed");
    Auth.$unauth();
  };

}

CardsCtrl.$inject = ['$scope', 'rootRef', 'Cards', 'Users', 'currentAuth', '$state', '$http', 'TDCardDelegate', 'Auth', 'cardsList'];

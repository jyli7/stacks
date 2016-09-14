angular.module('stacksApp.controllers', [])

  .controller('AuthCtrl', AuthCtrl)

  .controller('CardsCtrl', CardsCtrl)

  .controller('PasswordResetCtrl', PasswordResetCtrl)

  ;


function AuthCtrl(rootRef, $scope, AuthService, $state) {

  $scope.data = {};

  $scope.loginEmail = function() {
    AuthService.$authWithPassword({
      "email": $scope.data.email,
      "password": $scope.data.password
    }).then(function (authData) {
      $state.go('cards');
    }).catch(function (error) {
      console.log(error);
    });
  };

  $scope.loginWithFacebook = function loginWithFacebook() {
    AuthService.loginWithFacebook();
  };

  $scope.register = function () {
    AuthService.$createUser({
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

AuthCtrl.$inject = ['rootRef', '$scope', 'AuthService', '$state'];

function PasswordResetCtrl($scope, AuthService, $state) {
  $scope.data = {}; // Empty object to get the form data.

  /**
   * We grab our user's email from the form and send it to our service, piece of cake!
   */
  $scope.resetPassword = function(){
    var email = $scope.data.email;
    AuthService.resetPassword(email);
  };
}

PasswordResetCtrl.$inject = ['$scope', 'AuthService', '$state'];

function CardsCtrl ($scope, $rootScope, rootRef, $ionicListDelegate, Cards, $ionicPopup) {
  $scope.cards = [];
  $scope.usersRef = new Firebase('https://stacks703.firebaseio.com/users');

  $scope.init = function () {
    rootRef.onAuth(function (authData) {
      Cards.forUserId(authData.uid)
        .then(function (cardsForUser) {
          $scope.cards = cardsForUser;
          $scope.$apply();
        });
    });
  };

  $scope.addCard = function () {
    $scope.newCard = {};

    var myPopup = $ionicPopup.show({
      template: '<input class="item myNumberInput" type="text" ng-model="newCard.content" placeholder="Card content" style="background: white;"/>',
      title: '<b>Card content</b>',
      subTitle: 'What content would you like to add to this card?',
      scope: $scope,
      buttons: [
        {
          text: '<i class="icon ion-close"></i>',
          type: 'button',
          onTap: function(e) {
            return null;
          }
        },
        {
          text: '<i class="icon ion-checkmark"></i>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.newCard.content) {
              e.preventDefault();
            }
            else {
              return $scope.newCard;
            }
          }
        }
      ]
    });

    myPopup.then(function(newCard){
      if(!newCard || !newCard.content) return;

      rootRef.onAuth(function(authData) {
        if (authData) {
          Cards.addForUserId(authData.uid, newCard.content);
        }
      });
      $rootScope.$broadcast("refreshCards");
    });
  };

  $scope.completeCard = function (card) {
    var cardRef = new Firebase('https://stacks703.firebaseio.com/cards/' + card.$id);
    cardRef.child('status').set('completed');
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.init();

  $scope.$on("refreshCards", function () {
    $scope.init();
  });
}

CardsCtrl.$inject = ['$scope', '$rootScope', 'rootRef', '$ionicListDelegate', 'Cards', '$ionicPopup'];

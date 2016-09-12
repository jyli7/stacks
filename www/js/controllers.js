angular.module('starter.controllers', [])

  .controller('LoginCtrl', LoginCtrl)

  .controller('CardsCtrl', CardsCtrl);


function LoginCtrl(Auth, $state) {
  this.loginWithFacebook = function loginWithFacebook() {
    Auth.$authWithOAuthPopup('facebook')
      .then(function(authData) {
        $state.go('cards');
      });
  };
}

LoginCtrl.$inject = ['Auth', '$state'];

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

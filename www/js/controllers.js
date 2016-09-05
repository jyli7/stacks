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

function CardsCtrl ($scope, rootRef, $ionicListDelegate, Cards) {
  $scope.cards = Cards;

  $scope.addCard = function () {
    rootRef.onAuth(function(authData) {
      if (authData) {
        var content = prompt("What would you like to put on your card?");
        if (content) {
          $scope.cards.$add({
            'content': content,
            'userId': authData.uid
          });
        }
        console.log("Authenticated with uid:", authData.uid);
      } else {
        console.log("Client unauthenticated.")
      }
    });
  };

  $scope.completeCard = function (card) {
    var cardRef = new Firebase('https://stacks703.firebaseio.com/cards/' + card.$id);
    cardRef.child('status').set('completed');
    $ionicListDelegate.closeOptionButtons();
  };
}

CardsCtrl.$inject = ['$scope', 'rootRef', '$ionicListDelegate', 'Cards'];

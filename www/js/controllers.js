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
  $scope.cards = [];
  $scope.usersRef = new Firebase('https://stacks703.firebaseio.com/users');
  rootRef.onAuth(function (authData) {
    Cards.forUserId(authData.uid)
      .then(function (cardsForUser) {
        $scope.cards = cardsForUser;
        $scope.$apply();
    });
  });

  $scope.addCard = function () {
    rootRef.onAuth(function(authData) {
      if (authData) {
        var content = prompt("What would you like to put on your card?");
        if (content) {
          $scope.cards.$add({
            creator_id: authData.uid,
            content: content
          }).then(function (ref) {
            var id = ref.key();
            var pair = {};
            pair[id] = true;
            $scope.usersRef.child(authData.uid).child('cards').set(pair);
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

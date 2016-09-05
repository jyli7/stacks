// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

  .factory('Cards', ['$firebaseArray', function ($firebaseArray) {
    var cardsRef = new Firebase('https://stacks702.firebaseio.com/cards');
    return $firebaseArray(cardsRef);
  }])

  .controller('StackCtrl', function ($scope, $ionicListDelegate, Cards) {
    $scope.cards = Cards;

    $scope.addCard = function () {
      var content = prompt("What would you like to put on your card?");
      if (content) {
        $scope.cards.$add({
          'content': content
        });
      }
    };

    $scope.completeCard = function (card) {
      var cardRef = new Firebase('https://stacks702.firebaseio.com/cards/' + card.$id);
      cardRef.child('status').set('completed');
      $ionicListDelegate.closeOptionButtons();
    };

  });



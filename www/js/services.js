function Auth(rootRef, $firebaseAuth) {
  return $firebaseAuth(rootRef);
}

Auth.$inject = ['rootRef', '$firebaseAuth'];

angular.module('starter.services', []
)

  .factory('Auth', Auth)

  .factory('Cards', ['$firebaseArray', function ($firebaseArray) {
    var cardsRef = new Firebase('https://stacks703.firebaseio.com/cards');
    return $firebaseArray(cardsRef);
  }]);

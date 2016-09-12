function Auth(rootRef, $firebaseAuth) {
  return $firebaseAuth(rootRef);
}

Auth.$inject = ['rootRef', '$firebaseAuth'];

angular.module('starter.services', []
  )

  .factory('Auth', Auth)

  .factory('Users', ['rootRef', function(rootRef) {
    var usersRef = rootRef.child('users');
    var retObj = {};
    retObj.getUserById = function(userId) {
      return usersRef.child(userId);
    };
    return retObj;
  }])

  .factory('Cards', ['rootRef', 'Users', function (rootRef, Users) {
    var cardsRef = rootRef.child("cards");
    var retObj = {};

    retObj.forUserId = function (userId) {
      return Users.getUserById(userId).child("cards").once("value")
      .then(function (userCardsSnapshot) {
        var cardPromises = [];
        userCardsSnapshot.forEach(function (userCardSnapshot) {
          var cardData = {};
          cardPromises.push(
            retObj.getCardById(userCardSnapshot.key()).once("value")
              .then(function (cardSnapshot) {
                cardData = cardSnapshot.val();
                return cardData;
            })
          )
        });
        return cardPromises;
      })
      .then(function (cardDataPromises) {
        return Promise.all(cardDataPromises);
      })
    };

    retObj.getCardById = function (cardId) {
      return cardsRef.child(cardId);
    };

    return retObj;
  }]);




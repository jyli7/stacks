function AuthService(rootRef, $firebaseAuth) {
  var auth = $firebaseAuth(rootRef);
  return auth;
};

AuthService.$inject = ['rootRef', '$firebaseAuth'];

angular.module('stacksApp.services', []
  )

  .factory('AuthService', AuthService)

  .factory('Users', ['rootRef', function (rootRef) {
    var usersRef = rootRef.child('users');
    var retObj = {};
    retObj.getUserById = function (userId) {
      return usersRef.child(userId);
    };
    return retObj;
  }])

  .factory('Cards', ['rootRef', '$firebaseArray', function (rootRef, $firebaseArray) {
    var cardsRef = rootRef.child("cards");
    return {
      all: function () {
        return $firebaseArray(cardsRef);
      },

      forUser: function (userId) {
        var usersRef = rootRef.child("users");
        return $firebaseArray(usersRef.child(userId));
      }
    };

    //var retObj = {};
    //
    //retObj.forUserId = function (userId) {
    //  return Users.getUserById(userId).child("cards").once("value")
    //    .then(function (userCardsSnapshot) {
    //      var cardPromises = [];
    //      userCardsSnapshot.forEach(function (userCardSnapshot) {
    //        var cardData = {};
    //        cardPromises.push(
    //          retObj.getCardById(userCardSnapshot.key()).once("value")
    //            .then(function (cardSnapshot) {
    //              cardData = cardSnapshot.val();
    //              return cardData;
    //            })
    //        )
    //      });
    //      return cardPromises;
    //    })
    //    .then(function (cardDataPromises) {
    //      return Promise.all(cardDataPromises);
    //    })
    //};
    //
    //retObj.getCardById = function (cardId) {
    //  return cardsRef.child(cardId);
    //};
    //
    //retObj.addForUserId = function (userId, content) {
    //  if (!userId || !content) return;
    //
    //  var addedCard = cardsRef.push();
    //
    //  if (!addedCard) return;
    //
    //  rootRef.onAuth(function (authData) {
    //    var form = {
    //      id: addedCard.key(),
    //      creator_id: authData.uid,
    //      content: content,
    //      created: Firebase.ServerValue.TIMESTAMP,
    //      updated: Firebase.ServerValue.TIMESTAMP
    //    };
    //
    //    addedCard.set(form, function (err) {
    //      if (err) {
    //        console.error(err);
    //      } else {
    //        Users.getUserById(userId).child("cards").child(addedCard.key()).set(true);
    //      }
    //    });
    //  });
    //};
    //
    //return retObj;
  }]);




function Auth(rootRef, $firebaseAuth) {
  var auth = $firebaseAuth(rootRef);
  return auth;
};

Auth.$inject = ['rootRef', '$firebaseAuth'];

angular.module('stacksApp.services', []
  )

  .factory('Auth', Auth)

  .factory('Users', ['rootRef', '$firebaseArray', function (rootRef, $firebaseArray) {
    var usersRef = rootRef.child('users');
    return {
      getCardsForUserById: function (userId) {
        var cardsForUserRef = rootRef.child("users").child(userId).child('cards');
        return $firebaseArray(cardsForUserRef);
      },

      getTagsForUserById: function (userId) {
        var tagsForUserRef = rootRef.child("users").child(userId).child('tags');
        return $firebaseArray(tagsForUserRef);
      },

      addDeviceTokenToUser: function (userId, token) {
        var tokensRef = rootRef.child("users").child(userId).child('tokens');
        var tokenObj = {};
        tokenObj[token] = true;
        tokensRef.update(tokenObj);
      }
    };
  }])

  .factory('Cards', ['rootRef', '$firebaseArray', function (rootRef, $firebaseArray) {
    var cardsRef = rootRef.child("cards");
    return {
      all: function () {
        return $firebaseArray(cardsRef);
      },

      forUser: function (userId) {
        var cardsForUserRef = rootRef.child("cards").orderByChild("creator_id").equalTo(userId);
        return $firebaseArray(cardsForUserRef);
      }
    };

  }])

;




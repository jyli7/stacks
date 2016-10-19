function Auth(rootRef, $firebaseAuth) {
  var auth = $firebaseAuth(rootRef);
  return auth;
};

Auth.$inject = ['rootRef', '$firebaseAuth'];

angular.module('stacksApp.services', []
  )

  .factory('Auth', Auth)

  .factory('Users', ['rootRef', 'Cards', '$firebaseArray', function (rootRef, Cards, $firebaseArray) {
    var usersRef = rootRef.child('users');
    return {
      getCardsForUserById: function (userId) {
        var cardsForUserRef = rootRef.child("users").child(userId).child('cards');
        return $firebaseArray(cardsForUserRef);
      },

      getGroupsForUserById: function (userId) {
        var groupsForUserRef = rootRef.child("users").child(userId).child('groups');
        return $firebaseArray(groupsForUserRef);
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
      },

      createCardForUser: function (userId, card, senderId) {
        card.creator_id = userId;
        card.sender_id = senderId;
        Cards.forUser(userId).$add(card).then(function (ref) {
          var cardsForUserRef = rootRef.child("users").child(userId).child('cards');
          $firebaseArray(cardsForUserRef).$ref().child(ref.key()).set(true);
        });
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

  .factory('Groups', ['rootRef', '$firebaseArray', function (rootRef, $firebaseArray) {
    var groupsRef = rootRef.child("groups");
    return {
      all: function () {
        return $firebaseArray(groupsRef);
      },

      forUser: function (userId) {
        var groupsForUserRef = rootRef.child("groups").orderByChild("creator_id").equalTo(userId);
        return $firebaseArray(groupsForUserRef);
      }
    };

  }])

;




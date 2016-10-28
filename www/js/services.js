function Auth(rootRef, $firebaseAuth) {
  var auth = $firebaseAuth(rootRef);
  return auth;
};

Auth.$inject = ['rootRef', '$firebaseAuth'];

angular.module('stacksApp.services', []
  )

  .factory('Auth', Auth)

  .factory('Users', ['rootRef', 'Cards', '$firebaseArray', '$firebaseObject', function (rootRef, Cards, $firebaseArray, $firebaseObject) {
    var usersRef = rootRef.child('users');
    return {
      getUserById: function (userId) {
        return $firebaseObject(rootRef.child("users").child(userId));
      },

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

      createCardForUser: function (userId, card, senderId, senderEmail) {
        var newCard = JSON.parse(JSON.stringify(card));
        newCard.creator_id = userId;
        newCard.sender_id = senderId;
        newCard.sender_email = senderEmail;
        Cards.forUser(userId).$add(newCard).then(function (ref) {
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
        var nc = new Firebase.util.NormalizedCollection(
          [rootRef.child("/users/" + userId + "/groups"), "userGroups"],
          rootRef.child("/groups")
        ).select(
          "userGroups.$key",
          "groups.name",
          "groups.members",
          "groups.description"
        ).ref();
        return $firebaseArray(nc);
      }
    };

  }])

;




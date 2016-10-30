function Auth(rootRef, $firebaseAuth) {
  var auth = $firebaseAuth(rootRef);
  return auth;
};

Auth.$inject = ['rootRef', '$firebaseAuth'];

angular.module('stacksApp.services', []
  )

  .factory('Auth', Auth)

  .factory('Notifications', ['rootRef', '$http', function (rootRef, $http) {
    return {
      sendNotificationToUser: function (userTokens, msg) {
        tokens = Object.keys(userTokens);
        var data = {
          "tokens": tokens,
          "profile": "jimmy",
          "notification": {
            "message": msg
          }
        };

        $http({
          url: 'https://api.ionic.io/push/notifications', //URL to hit
          method: 'POST', //Specify the method
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI1NGEwYTJlZi0wZjkxLTQ5MGUtYTMwYy00NzE4YTAyNzk4YmUifQ.L5Ylvt6lvJ7IYQEYHIqkWOnqNy7MYJjPA1i0UwGkWCw"
          },
          data: data
        }).then(function successCallback(response) {
          }, function errorCallback(response) {
        });
      }
    }
  }])

  .factory('Users', ['rootRef', 'Cards', 'CardInvites', '$firebaseArray', '$firebaseObject', function (rootRef, Cards, CardInvites, $firebaseArray, $firebaseObject) {
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

      getGroupInvitesForUserById: function (userId) {
        var groupInvitesForUserRef = rootRef.child("users").child(userId).child('groupInvites');
        return $firebaseArray(groupInvitesForUserRef);
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
      },

      createCardInviteForUser: function (userId, card, senderId, senderEmail) {
        var newCard = JSON.parse(JSON.stringify(card));
        newCard.invitee_id = userId;
        newCard.inviter_id = senderId;
        newCard.sender_email = senderEmail;
        CardInvites.forUser(userId).$add(newCard).then(function (ref) {
          var cardInvitesForUserRef = rootRef.child("users").child(userId).child('cardInvites');
          $firebaseArray(cardInvitesForUserRef).$ref().child(ref.key()).set(true);
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

  .factory('CardInvites', ['rootRef', '$firebaseArray', function (rootRef, $firebaseArray) {
    var cardInvitesRef = rootRef.child("cardInvites");
    return {
      forUser: function (userId) {
        var cardsForUserRef = rootRef.child("cardInvites").orderByChild("invitee_id").equalTo(userId);
        return $firebaseArray(cardsForUserRef);
      }
    }
  }])

  .factory('GroupInvites', ['rootRef', '$firebaseArray', function (rootRef, $firebaseArray) {
    var groupInvitesRef = rootRef.child("groupInvites");
    return {
      getInvitesForUserId: function (userId) {
        var nc = new Firebase.util.NormalizedCollection(
          [rootRef.child("/users/" + userId + "/groupInvites"), "userGroupInvites"],
          rootRef.child("/groupInvites")
        ).select(
          "userGroupInvites.$key",
          "groupInvites.group_id",
          "groupInvites.group_name",
          "groupInvites.inviter_email",
          "groupInvites.inviter_id"
        ).ref();
        return $firebaseArray(nc);
      }
    }
  }])

  .factory('Groups', ['rootRef', '$firebaseArray', '$firebaseObject', function (rootRef, $firebaseArray, $firebaseObject) {
    var groupsRef = rootRef.child("groups");
    return {
      all: function () {
        return $firebaseArray(groupsRef);
      },

      getGroupById: function (groupId) {
        return $firebaseObject(rootRef.child("groups").child(groupId));
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
      },

      getMembersWithGroupId: function (groupId) {
        var nc = new Firebase.util.NormalizedCollection(
          [rootRef.child("/groups/" + groupId + "/members"), "groupMembers"],
          rootRef.child("/users")
        ).select(
          "groupMembers.$key",
          "users.uid",
          "users.email",
          "users.groups"
        ).ref();
        return $firebaseArray(nc);
      }
    };

  }])

;




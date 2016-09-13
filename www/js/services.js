function AuthService(rootRef, $firebaseAuth, $state) {
  var authUser = $firebaseAuth(rootRef);
  return {
    signupWithEmail: function (email, password) {
      authUser.$createUser({
        email: email,
        password: password
      }).then(function (authData) {
        rootRef.child("users").child(authData.uid).set({
          email: email
        }).then(function () {
          $state.go('cards');
        });
      }).catch(function (error) {
        switch (error.code) {
          case "EMAIL_TAKEN":
            alert("Sorry, that email is already taken");
            break;
          case "INVALID_EMAIL":
            alert("Sorry, that is an invalid email address");
            break;
          default:
            alert("Error creating user:", error);
        }
      });
    },

    loginUser: function (email, password) {
      authUser.$authWithPassword({
        "email": email,
        "password": password
      }).then(function (authData) {
        $state.go('cards');
      }).catch(function (error) {
        console.log(error);
      });
    },

    loginWithFacebook: function () {
      authUser.$authWithOAuthPopup('facebook')
      .then(function(authData) {
        $state.go('cards');
      });
    },

    resetPassword: function (resetEmail) {
      authUser.$resetPassword({
        email: resetEmail
      }).then(function () {
        console.log('Password Reset Email was sent successfully');
      }).catch(function (error) {
        console.log(error);
      });
    }
  }
}

AuthService.$inject = ['rootRef', '$firebaseAuth', '$state'];

angular.module('starter.services', []
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

    retObj.addForUserId = function (userId, content) {
      if (!userId || !content) return;

      var addedCard = cardsRef.push();

      if (!addedCard) return;

      rootRef.onAuth(function (authData) {
        var form = {
          id: addedCard.key(),
          creator_id: authData.uid,
          content: content,
          created: Firebase.ServerValue.TIMESTAMP,
          updated: Firebase.ServerValue.TIMESTAMP
        };

        addedCard.set(form, function (err) {
          if (err) {
            console.error(err);
          } else {
            Users.getUserById(userId).child("cards").child(addedCard.key()).set(true);
          }
        });
      });
    };

    return retObj;
  }]);




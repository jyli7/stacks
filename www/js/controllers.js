angular.module('stacksApp.controllers', [])

  .controller('AuthCtrl', AuthCtrl)

  .controller('CardsCtrl', CardsCtrl)

  .controller('GroupsCtrl', GroupsCtrl)

  .controller('SettingsCtrl', SettingsCtrl)

  .controller('PasswordResetCtrl', PasswordResetCtrl)

  .controller('AppCtrl', AppCtrl)
;


function AuthCtrl(rootRef, $scope, Auth, $state, Users, $ionicPush) {

  $scope.data = {};

  $scope.loginEmail = function () {
    Auth.$authWithPassword({
      "email": $scope.data.email,
      "password": $scope.data.password
    }).then(function (authData) {
      if ($ionicPush.token) {
        Users.addDeviceTokenToUser(authData.uid, $ionicPush.token["token"]);
      }
    }).catch(function (error) {
      alert(error);
    });
  };

  $scope.loginWithFacebook = function () {
    Auth.loginWithFacebook();
  };

  $scope.register = function () {
    Auth.$createUser({
      email: $scope.data.email,
      password: $scope.data.password
    }).then(function (authData) {
      rootRef.child("users").child(authData.uid).set({
        email: $scope.data.email
      }).then(function () {
        $scope.loginEmail({email: $scope.data.email, password: $scope.data.password});
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
  };
}

AuthCtrl.$inject = ['rootRef', '$scope', 'Auth', '$state', 'Users', '$ionicPush'];

function PasswordResetCtrl($scope, Auth, $state) {
  $scope.data = {}; // Empty object to get the form data.

  /**
   * We grab our user's email from the form and send it to our service, piece of cake!
   */
  $scope.resetPassword = function () {
    var email = $scope.data.email;
    Auth.resetPassword(email);
  };
}

PasswordResetCtrl.$inject = ['$scope', 'Auth', '$state'];

function CardsCtrl($scope, rootRef, Cards, Users, Groups, currentAuth, $state, $http, TDCardDelegate, Auth, cardsList, $ionicModal) {

  $ionicModal.fromTemplateUrl('templates/createCard.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/shareWithGroups.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.shareWithGroupsModal = modal;
  });

  $scope.showShareWithGroupsModal = function (cardToShare) {
    $scope.selectedCard = cardToShare;
    $scope.shareWithGroupsModal.show();
  };

  $scope.cards = cardsList;

  $scope.groups = Groups.forUser(currentAuth.uid);

  $scope.newCard = {
    front: '',
    back: '',
    frontIsActive: true,
    //tags: $scope.selectedTags,
    creator_id: currentAuth.uid,
    last_updated: Date.now(),
    completed: false
  };

  $scope.createCard = function () {
    $scope.cards.$add($scope.newCard).then(function (ref) {
      $scope.newCard.front = '';
      $scope.newCard.back = '';
      Users.getCardsForUserById(currentAuth.uid).$ref().child(ref.key()).set(true);
      $scope.modal.hide();
    });
  };

  $scope.shareWithGroups = function () {
    var selectedGroups = $scope.groups.filter(function (group) { return group.selected === true });
    if (selectedGroups.length > 0) {
      var response = confirm("Share this card with selected groups?");
      if (response == true) {
        var groupMemberIds = new Set();
        selectedGroups.forEach(function (group) {
          rootRef.child("groups").child(group.$id).child('members').on('value', function (snapshot) {
            snapshot.forEach(function (data) {
              var groupMemberId = data.key();
              if (groupMemberId !== currentAuth.uid && !groupMemberIds.has(groupMemberId)) {
                groupMemberIds.add(groupMemberId);
                Users.createCardForUser(groupMemberId, $scope.selectedCard, currentAuth.uid, currentAuth.password.email);
              }
            });
          });
        });
        $scope.shareWithGroupsModal.hide();
        $scope.groups.forEach(function (group) { group.selected = false; });
      };
    } else {
      alert("You have not selected any groups");
    }

  };

  //$scope.selectedTags = [];

  $scope.switchActiveSide = function (card) {
    card.frontIsActive = !card.frontIsActive;
  };

  $scope.zIndexCount = -2;

  $scope.recycle = function (card, scope) {
    console.log("Recycling");
    var el = scope.el;
    var yesText = el.querySelector('.yes-text');

    card.last_updated = Date.now();
    $scope.cards.$save(card).then(function () {
      $scope.zIndexCount -= 1;
      el.style.zIndex = $scope.zIndexCount;
      yesText.style.opacity = 0;
      setTimeout(function () {
        el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
        el.style.transition = el.style.webkitTransition = 'all 0.75s ease-in-out';
      }, 500);
      setTimeout(function () {
        el.style.transition = el.style.webkitTransition = 'all 0s linear';
      }, 1000)
    });
  };

  $scope.complete = function (card) {
    console.log("Trashing....");
    card.last_updated = Date.now();
    card.completed = true;
    $scope.cards.$save(card);
  };
}

CardsCtrl.$inject = ['$scope', 'rootRef', 'Cards', 'Users', 'Groups', 'currentAuth', '$state', '$http', 'TDCardDelegate', 'Auth', 'cardsList', '$ionicModal'];

function AppCtrl(rootRef, $scope, Auth, $state, Users, $ionicPush) {
  $scope.logout = function () {
    $scope.cards = [];
    Auth.$unauth();
  };
};

AppCtrl.$inject = ['rootRef', '$scope', 'Auth', '$state', 'Users', '$ionicPush'];

function GroupsCtrl($scope, rootRef, Groups, Users, currentAuth, $state, $http, Auth, $ionicModal) {
  $ionicModal.fromTemplateUrl('templates/createGroup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.groups = Groups.forUser(currentAuth.uid);

  $scope.newGroup = {
    name: '',
    description: '',
    creator_id: currentAuth.uid,
    members: ''
  };

  $scope.createGroup = function () {
    var memberEmails = $scope.newGroup.members.split(",|, ");
    delete $scope.newGroup.members;

    var groupsRef = rootRef.child("groups");
    groupsRef.push($scope.newGroup).then(function (groupRef) {
      $scope.newGroup.name = '';
      $scope.newGroup.description = '';
      $scope.modal.hide();
      // Add group to requested members, add members to group
      for (var i = 0; i < memberEmails.length; memberEmails++) {
        var email = memberEmails[i];
        rootRef.child('users').orderByChild('email').equalTo(email).once('value', function(snapshot) {
          snapshot.forEach(function (data) {
            var userId = data.key();
            Users.getGroupsForUserById(userId).$ref().child(groupRef.key()).set(true);
            rootRef.child('groups').child(groupRef.key()).child('members').child(userId).set(true);
          });
        });
      }
      // Add group to creator, add creator to group
      Users.getGroupsForUserById($scope.newGroup.creator_id).$ref().child(groupRef.key()).set(true);
      rootRef.child('groups').child(groupRef.key()).child('members').child($scope.newGroup.creator_id).set(true);
    });
  };
};

GroupsCtrl.$inject = ['$scope', 'rootRef', 'Groups', 'Users', 'currentAuth', '$state', '$http', 'Auth', '$ionicModal'];

function SettingsCtrl($scope, rootRef, Groups, Users, currentAuth, $state, $http, Auth, $ionicModal) {
  $scope.user = currentAuth;

  var userRef = rootRef.child("users").child(currentAuth.uid);
  $scope.updateSettings = function () {
    userRef.set($scope.user);
  };
};

SettingsCtrl.$inject = ['$scope', 'rootRef', 'Groups', 'Users', 'currentAuth', '$state', '$http', 'Auth', '$ionicModal'];




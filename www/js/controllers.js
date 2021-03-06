angular.module('stacksApp.controllers', [])

  .controller('AuthCtrl', AuthCtrl)

  .controller('CardsCtrl', CardsCtrl)

  .controller('GroupsCtrl', GroupsCtrl)

  .controller('SettingsCtrl', SettingsCtrl)

  .controller('PasswordResetCtrl', PasswordResetCtrl)

  .controller('AppCtrl', AppCtrl)
;


function AuthCtrl(rootRef, $scope, Auth, Tokens, $state, Users, $ionicPush, $ionicModal) {

  $ionicModal.fromTemplateUrl('templates/loginForm.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.loginModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/signupForm.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.signupModal = modal;
  });

  $scope.data = {};
  $scope.setActiveUserIdOnTokens = function (userId) {
    var userTokens = rootRef.child("users").child(userId).child("tokens").on('value', function (snapshot) {
      snapshot.forEach(function (data) {
        var tokenId = data.key();
        Tokens.setActiveUserId(tokenId, userId);
      });
    });
  };

  $scope.isLoading = false;

  $scope.loginEmail = function () {

    $scope.isLoading = true;
    Auth.$authWithPassword({
      "email": $scope.data.email,
      "password": $scope.data.password
    }).then(function (authData) {
      if ($ionicPush.token) {
        Users.addDeviceTokenToUser(authData.uid, $ionicPush.token["token"]).then(function () {
          $scope.setActiveUserIdOnTokens(authData.uid);
        });
      } else {
        $scope.setActiveUserIdOnTokens(authData.uid);
      }
      $scope.isLoading = false;
      setTimeout(function () {
        $scope.loginModal.hide();
      }, 500);
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

AuthCtrl.$inject = ['rootRef', '$scope', 'Auth', 'Tokens', '$state', 'Users', '$ionicPush', '$ionicModal'];

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

function CardsCtrl($scope, rootRef, Cards, Users, Groups, currentAuth, $state, $http, TDCardDelegate, Auth, cardsList, $ionicModal, Notifications, $ionicPopup) {

  $scope.frontCharLimit = 250;

  $scope.backCharLimit = 250;

  $ionicModal.fromTemplateUrl('templates/createCard.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/shareWithGroups.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.shareWithGroupsModal = modal;
  });

  $scope.cardDisablePartialSwipe = function (amt) {
  };

  $scope.showShareWithGroupsModal = function (cardToShare) {
    $scope.selectedCard = cardToShare;
    $scope.shareWithGroupsModal.show();
  };

  $scope.cards = cardsList;

  $scope.currentCardNum = 0;

  $scope.groups = Groups.forUser(currentAuth.uid);

  $scope.newCard = {
    front: '',
    back: '',
    frontIsActive: true,
    //tags: $scope.selectedTags,
    creator_id: currentAuth.uid,
    last_updated: Date.now()
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
    var selectedGroups = $scope.groups.filter(function (group) {
      return group.selected === true
    });
    var inviterEmail = currentAuth.password.email;
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
                Users.createCardInviteForUser(groupMemberId, $scope.selectedCard, currentAuth.uid, inviterEmail);
                var msg = inviterEmail + " has shared a card with you. Check it out to accept or decline.";
                rootRef.child("users").child(groupMemberId).once('value', function (snapshot) {
                  var user = snapshot.val();
                  Notifications.sendNotificationToUser(user.tokens, msg);
                });
              }
            });
          });
        });
        $scope.groups.forEach(function (group) {
          group.selected = false;
        });
        $ionicPopup.alert({
          title: 'Success!',
          template: 'Shared card with groups!'
        });
        $scope.shareWithGroupsModal.hide();
      }
    } else {
      alert("You have not selected any groups");
    }
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
      //yesText.style.opacity = 0;
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
    var cardId = card.$id;
    rootRef.child('cards').child(cardId).remove(function (error) {
      if (error) {
        console.log("Card destroy failed");
      } else {
        rootRef.child('users').child(currentAuth.uid).child('cards').child(cardId).remove(function (error) {
          if (error) {
            console.log("User card destroy failed");
          }
        });
      }
    });

  };
}

CardsCtrl.$inject = ['$scope', 'rootRef', 'Cards', 'Users', 'Groups', 'currentAuth', '$state', '$http', 'TDCardDelegate', 'Auth', 'cardsList', '$ionicModal', 'Notifications', '$ionicPopup'];

function AppCtrl(rootRef, $scope, Auth, GroupInvites, Groups, CardInvites, currentAuth, $state, Users, $ionicPush, $ionicModal) {
  $ionicModal.fromTemplateUrl('templates/notifications.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.notificationsModal = modal;
  });

  $scope.switchActiveSide = function (card) {
    card.frontIsActive = !card.frontIsActive;
  };

  $scope.user = Users.getUserById(currentAuth.uid);
  $scope.groupInvites = GroupInvites.getInvitesForUserId(currentAuth.uid);
  $scope.cardInvites = CardInvites.forUser(currentAuth.uid);

  $scope.logout = function () {
    $scope.cards = [];
    Auth.$unauth();
  };

  $scope.acceptGroupInvite = function (invite) {
    Users.getGroupsForUserById(currentAuth.uid).$ref().child(invite.group_id).set(true);
    rootRef.child('groups').child(invite.group_id).child('members').child(currentAuth.uid).set(true);
    $scope.deleteGroupInviteForCurrentUser(invite);
  };

  $scope.declineGroupInvite = function (invite) {
    $scope.deleteGroupInviteForCurrentUser(invite);
  };

  $scope.deleteGroupInviteForCurrentUser = function (invite) {
    var inviteId = invite.$id;
    rootRef.child('groupInvites').child(inviteId).remove().then(function () {
      rootRef.child('users').child(currentAuth.uid).child('groupInvites').child(inviteId).remove().then(function () {
        $scope.groupInvites = GroupInvites.getInvitesForUserId(currentAuth.uid);
      });
    });
  }

  $scope.acceptCardInvite = function (invite) {
    var card = {
      front: invite.front,
      back: invite.back,
      frontIsActive: true,
      creator_id: currentAuth.uid,
      last_updated: Date.now()
    };
    Users.createCardForUser(invite.invitee_id, card, invite.inviter_id, invite.sender_email);
    $scope.deleteCardInviteForCurrentUser(invite);
  };

  $scope.declineCardInvite = function (invite) {
    $scope.deleteCardInviteForCurrentUser(invite);
  };

  $scope.deleteCardInviteForCurrentUser = function (invite) {
    var inviteId = invite.$id;
    rootRef.child('cardInvites').child(inviteId).remove().then(function () {
      rootRef.child('users').child(currentAuth.uid).child('cardInvites').child(inviteId).remove().then(function () {
        $scope.cardInvites = CardInvites.forUser(currentAuth.uid);
      });
    });
  }
};

AppCtrl.$inject = ['rootRef', '$scope', 'Auth', 'GroupInvites', 'Groups', 'CardInvites', 'currentAuth', '$state', 'Users', '$ionicPush', '$ionicModal'];

function GroupsCtrl($scope, rootRef, Groups, Users, currentAuth, $state, $http, Auth, $ionicModal, Notifications, $ionicPopup) {

  $ionicModal.fromTemplateUrl('templates/createGroup.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/groupShow.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.groupShowModal = modal;
  });

  $scope.createGroupInvites = function (memberEmails, groupId, group, inviterEmail, currentAuth) {
    var groupName = group.name;

    for (var i = 0; i < memberEmails.length; i++) {
      var email = memberEmails[i];
      rootRef.child('users').orderByChild('email').equalTo(email).once('value', function (snapshot) {
        snapshot.forEach(function (data) {
          var userId = data.key();
          var groupInvite = {
            invitee_id: userId,
            inviter_id: currentAuth.uid,
            inviter_email: inviterEmail,
            group_id: groupId,
            group_name: groupName
          };
          rootRef.child('groupInvites').push(groupInvite).then(function (groupInviteRef) {
            var user = data.val();
            var msg = "You have been invited to join the group " + groupName + " by the user " + inviterEmail;
            Notifications.sendNotificationToUser(user.tokens, msg);
            Users.getGroupInvitesForUserById(userId).$ref().child(groupInviteRef.key()).set(true);
          });
        });
      });
    }
  };

  $scope.showGroupModal = function (group) {
    $scope.selectedGroup = group;
    $scope.selectedGroupMembers = Groups.getMembersWithGroupId(group.$key);
    $scope.userIsCreatorOfSelectedGroup = $scope.selectedGroup.creator_id === currentAuth.uid;
    $scope.groupShowModal.show();
  };

  $scope.addGroupMembers = function () {
    var memberEmails = $scope.selectedGroup.newMemberEmails.split(/, |,/);
    var inviterEmail = currentAuth.password.email || "Inviter email unknown";

    $scope.createGroupInvites(memberEmails, $scope.selectedGroup.$id, $scope.selectedGroup, inviterEmail, currentAuth);
    $scope.selectedGroup.newMemberEmails = "";

    setTimeout(function () {
      $ionicPopup.alert({
        title: 'Success!',
        template: 'Sent out group invites!'
      });
    }, 500);

  };

  $scope.groups = Groups.forUser(currentAuth.uid);

  $scope.newGroup = {
    name: '',
    description: '',
    creator_id: currentAuth.uid,
    members: ''
  };

  $scope.removeFromGroup = function (member) {
    delete $scope.selectedGroup.members[member.$id];
    delete member.groups[$scope.selectedGroup.$id];

    var confirmPopup = $ionicPopup.confirm({
      title: 'Removing user',
      template: 'Are you sure you want to remove this user?'
    });

    confirmPopup.then(function (res) {
      if (res) {
        rootRef.child('groups').child($scope.selectedGroup.$id).update({members: $scope.selectedGroup.members}).then(function () {
          rootRef.child('users').child(member.$id).update({groups: member.groups});
        });
      }
    });
  };

  $scope.destroyGroup = function (group) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Destroying group',
      template: 'Are you sure you want to destroy this group?'
    });

    confirmPopup.then(function (res) {
      if (res) {
        var members = group.members;
        for (var memberId in group.members) {
          if (group.members.hasOwnProperty(memberId)) {
            rootRef.child('users').child(memberId).child('groups').child(group.$id).remove();
          }
        }

        rootRef.child('groupInvites').orderByChild('group_id').equalTo(group.$id).once('value', function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var groupInviteId = childSnapshot.key();
            var groupInvite = childSnapshot.val();
            rootRef.child('users').child(groupInvite.invitee_id).child('groupInvites').child(groupInviteId).remove();
            childSnapshot.ref().remove();
          });
        });

        rootRef.child('groups').child(group.$id).remove(function (error) {
          if (error) {
            console.log("Group destroy failed");
          } else {
            $scope.groupShowModal.hide();
          }
        });
      }
    });
  };

  $scope.createGroup = function () {
    var memberEmails = [];
    if ($scope.newGroup.members && $scope.newGroup.members.length > 0) {
      memberEmails = $scope.newGroup.members.split(/, |,/);
      delete $scope.newGroup.members;
    }

    var groupsRef = rootRef.child("groups");

    // Create the group itself
    groupsRef.push($scope.newGroup).then(function (groupRef) {
      var groupId = groupRef.key();
      var groupName = $scope.newGroup.name;
      var inviterEmail = currentAuth.password.email || "Inviter email unknown";
      $scope.newGroup.name = '';
      $scope.newGroup.description = '';
      $scope.modal.hide();

      if (memberEmails.length > 0) {
        groupRef.once("value", function (snapshot) {
          var group = snapshot.val();
          $scope.createGroupInvites(memberEmails, groupId, group, inviterEmail, currentAuth);
        })
      }

      // Add group to creator, add creator to group
      rootRef.child('users').child(currentAuth.uid).child('groups').child(groupRef.key()).set(true);
      rootRef.child('groups').child(groupRef.key()).child('members').child(currentAuth.uid).set(true);
    });
  };
};

GroupsCtrl.$inject = ['$scope', 'rootRef', 'Groups', 'Users', 'currentAuth', '$state', '$http', 'Auth', '$ionicModal', 'Notifications', '$ionicPopup'];

function SettingsCtrl($scope, rootRef, Groups, Users, currentAuth, $state, $http, Auth, $ionicModal) {
  $scope.user = Users.getUserById(currentAuth.uid);

  $scope.user.$loaded().then(function () {
    //$scope.numNotificationsPerBatch = $scope.user.numNotificationsPerBatch;
  });

  var userRef = rootRef.child("users").child(currentAuth.uid);
  $scope.updateSettings = function () {
    $scope.user.$save().then(function () {
      alert("Settings saved!");
    });
  };
};

SettingsCtrl.$inject = ['$scope', 'rootRef', 'Groups', 'Users', 'currentAuth', '$state', '$http', 'Auth', '$ionicModal'];




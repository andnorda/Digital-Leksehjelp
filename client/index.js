Template.loggedInHeader.currentUserEmail = function () {
    return Meteor.user().username;
};

Template.loggedInHeader.isAdmin = function () {
    return Meteor.user().profile.role === ROLES.ADMIN;
};

Template.footer.events({
    'click button#moreInfo' : function () {
        $('#moreInfoModal').modal();
    }
});

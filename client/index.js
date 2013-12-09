Template.loggedInHeader.currentUserEmail = function () {
    return Meteor.user().username;
};

Template.loggedInHeader.isAdmin = function () {
    return Meteor.user().profile.role === ROLES.ADMIN;
};

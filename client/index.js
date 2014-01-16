Template.loggedInHeader.currentUserEmail = function () {
    return Meteor.user().username;
};

Template.loggedInHeader.isAdmin = function () {
    return Meteor.user().profile.role === ROLES.ADMIN;
};

Template.footer.events({
    'click button#moreInfo' : function () {
        $('#moreInfoModal').modal();
    },

    'click a.textLink' : function (event) {
        mixpanel.track("Andre aktiviteter", { "url": event.currentTarget.href });
    }
});

Template.loggedInVolunteers.loggedInVolunteers = function () {
    return Meteor.users.find({
        $and: [
            { 'services.resume.loginTokens': { $exists:true } },
            { 'services.resume.loginTokens': { $not: { $size: 0 } }},
            { 'profile.firstName': { $not: "Orkis" }}
        ]}).fetch();
};

Template.loggedInVolunteers.open = function () {
    var serviceStatusArray = Config.find({ name: "serviceStatus" }).fetch();

    if (serviceStatusArray.length > 0) {
        return serviceStatusArray[0].open;
    }
    return false;
};

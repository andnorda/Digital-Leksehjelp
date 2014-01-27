Template.loggedInHeader.currentUserEmail = function () {
    return Meteor.user().username;
};

Template.login.events({
    'click' : function (event) {
        if (event.currentTarget.id === "signup-link") {
            alert("Vennligst snakk med Røde Kors for å få en bruker her.");
        }
    }
});

Template.loggedInHeader.isAdmin = function () {
    return Meteor.user().profile.role === ROLES.ADMIN;
};

Template.practicalInfo.events({
    'click button#moreInfo' : function () {
        $('#moreInfoModal').modal();
    }
});

Template.footer.events({
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

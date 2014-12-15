Template.loggedInHeader.helpers({
    currentUserEmail: function () {
        return Meteor.user().username;
    },
    isActiveTab: function (route) {
        if (Router.current().route.getName() === route) {
            return "active";
        }
    },
    isAdmin: function () {
        return Meteor.user().profile.role === ROLES.ADMIN;
    },
    isVideohelper: function () {
        var user = Meteor.user();
        return user.profile.role === ROLES.ADMIN || user.profile.allowVideohelp;
    }
});

Template.login.events({
    'click' : function (event) {
        if (event.currentTarget.id === "signup-link") {
            alert("Vennligst snakk med Røde Kors for å få en bruker her.");
        }
    }
});

Session.set("serviceStatusLoaded", false);
Session.set("openingHoursLoaded", false);

Meteor.subscribe("serviceStatus", function onComplete() {
    Session.set("serviceStatusLoaded", true);
});
Meteor.subscribe("openingHours", function onComplete() {
    Session.set("openingHoursLoaded", true);
});
Meteor.subscribe("subjects");
Meteor.subscribe("loggedInUsers");
Meteor.subscribe("questions");

var lastUserId;
Deps.autorun(function () {
    Meteor.subscribe("sessions", Session.get("studentSessionId"));
    if(Meteor.user()) {
        if (Meteor.user().profile && Meteor.user().profile.firstName) {
            Meteor.subscribe("all-users");
            Meteor.subscribe("student-queue");
            Meteor.subscribe("config");
            if (Meteor.user().profile.setSubjectsAvailable) {
                Meteor.call('setSubjectsAvailable',
                {
                    subjects: Meteor.user().profile.subjects
                });
            }
            if (Meteor.user().profile.forceLogOut) {
                Meteor.logout();
            }
        }
    }
});

FlashMessages.configure({
    autoHide: false
});

Meteor.Spinner.options = {
    top: '3'
};

(function () {
    var original = document.title;
    var timeout;

    window.flashTitle = function (newMsg, howManyTimes) {
        function step() {
            document.title = (document.title == original) ? newMsg : original;

            if (--howManyTimes > 0) {
                timeout = setTimeout(step, 1000);
            };
        };

        howManyTimes = parseInt(howManyTimes);

        if (isNaN(howManyTimes)) {
            howManyTimes = 5;
        };

        cancelFlashTitle(timeout);
        step();
    };

    window.cancelFlashTitle = function () {
        clearTimeout(timeout);
        document.title = original;
    };

}());

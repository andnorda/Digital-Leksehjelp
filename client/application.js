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

UI.registerHelper('isGreaterThanZero', function(value) {
  if(value > 0) {
    return true;
  }
  return false
});

UI.registerHelper('not', function(value) {
    return !value;
});

UI.registerHelper('globalRoles', function(block) {
    return ROLES;
});

UI.registerHelper('optionsSelected', function(values, defaultValue) {
    var buffer = "";
    if (Array.isArray(values)) {
        // TODO(martin): If needed, treat as array.
    } else {
        // Treat as object
        for (var value in values) {
            var option = '';
            if (values[value] === defaultValue) {
                buffer += '<option selected>' + values[value] + '</option>';
            } else {
                buffer += '<option>' + values[value] + '</option>';
            };
        }
    }
    return new Spacebars.SafeString(buffer);
});

Template.registerHelper('transformNewline', function(text) {
    return new Spacebars.SafeString(text.replace(/\n/g, "<br>"));
});

Template.registerHelper('serviceIsOpen', function () {
    var serviceStatusArray = Config.find({ name: "serviceStatus" }).fetch();
        if (serviceStatusArray.length > 0) {
            return serviceStatusArray[0].open;
        }
        return false;
    }
);

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

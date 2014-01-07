Meteor.subscribe("all-users");
Meteor.subscribe("loggedInUsers");
Meteor.subscribe("subjects");
Meteor.subscribe("availableSubjects");
Meteor.subscribe("student-queue");
Meteor.subscribe("config");
Meteor.subscribe("openingHours");
Meteor.subscribe("serviceStatus");

var lastUserId;
Deps.autorun(function () {
    Meteor.subscribe("sessions", Session.get("studentSessionId"));
    if(Meteor.user()) {
        if (Meteor.user().profile && Meteor.user().profile.firstName) {
            lastUserId = Meteor.user()._id;
            if (Meteor.user().profile.setSubjectsAvailable) {
                Meteor.call('setSubjectsAvailable',
                {
                    subjects: Meteor.user().profile.subjects
                });
            }
            if (Meteor.user().profile.forceLogOut) {
                Meteor.call('resetForceLogOut',
                    {
                        userId: Meteor.user()._id
                    });
                Meteor.logout();
            }
        }
    } else {
        if (lastUserId) {
            Meteor.call('userLoggedOut',
            {
                userId: lastUserId
            });
            lastUserId = null;
        }
    }
});

FlashMessages.configure({
    autoHide: false
});

Handlebars.registerHelper('ifGreaterThanZero', function(v1, options) {
  if(v1 > 0) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('eachProperty', function(context, options) {
    var ret = "";
    for(var prop in context)
    {
        ret = ret + options.fn({property:prop,value:context[prop]});
    }
    return ret;
});

Handlebars.registerHelper('globalRoles', function(block) {
    return ROLES;
});

Handlebars.registerHelper('optionsSelected', function(values, defaultValue, options) {
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
    return new Handlebars.SafeString(buffer);
});

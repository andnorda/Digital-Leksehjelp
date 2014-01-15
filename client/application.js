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

Handlebars.registerHelper("foreach",function(arr,options) {
    if(options.inverse && !arr.length)
        return options.inverse(this);

    return arr.map(function(item,index) {
        item.$index = index;
        item.$first = index === 0;
        item.$last  = index === arr.length-1;
        return options.fn(item);
    }).join('');
});

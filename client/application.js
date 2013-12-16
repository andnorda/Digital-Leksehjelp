Meteor.subscribe("all-users");
Meteor.subscribe("loggedInUsers");
Meteor.subscribe("subjects");
Meteor.subscribe("student-queue");

FlashMessages.configure({
    autoHide: false
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

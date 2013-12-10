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

Deps.autorun(function () {
    Meteor.subscribe("all-users");
});

FlashMessages.configure({
    autoHide: true,
    hideDelay: 10000
});

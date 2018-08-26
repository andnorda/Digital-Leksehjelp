import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.registerHelper('and', function(value1, value2) {
    return value1 && value2;
});

Template.registerHelper('or', function(value1, value2) {
    return value1 || value2;
});

Template.registerHelper('xor', function(value1, value2) {
    return !(value1 && value2) && (value1 || value2);
});

Template.registerHelper('toLowerCase', function(string) {
    return string && string.toLowerCase();
});

Template.registerHelper('notEmpty', function() {
    return [].slice
        .call(arguments)
        .filter(obj => obj instanceof Meteor.Collection.Cursor)
        .some(cursor => cursor.count());
});

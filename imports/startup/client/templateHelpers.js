import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';
import { GRADES } from '/imports/constants.js';

validationErrorDep = new Deps.Dependency();
validationError = [];

Template.registerHelper('validationError', function(errorType) {
    validationErrorDep.depend();
    if (validationError && validationError.indexOf(errorType) > -1) {
        if (errorType === 'attachmentError') {
            return 'dl-attachment-error';
        }
        return 'validation-error';
    }
});

Template.registerHelper('eq', function(value1, value2) {
    return value1 === value2;
});

Template.registerHelper('and', function(value1, value2) {
    return value1 && value2;
});

Template.registerHelper('or', function(value1, value2) {
    return value1 || value2;
});

Template.registerHelper('transformNewline', function(text) {
    if (text) {
        return new Spacebars.SafeString(text.replace(/(\r\n|\n|\r)/g, '<br>'));
    }
});

Template.registerHelper('trim', function(str, stopIndex) {
    if (str.length < stopIndex) {
        return str;
    }
    return `${str.substring(0, stopIndex)}...`;
});

Template.registerHelper('grades', function() {
    return GRADES;
});

Template.registerHelper('fromNow', function(date) {
    if (date) {
        return moment(date).fromNow();
    }
});

Template.registerHelper('prettifyDate', function(date) {
    if (date) {
        return moment(date).format('D.M.YYYY HH:mm');
    }
});

Template.registerHelper('isNotMe', function(userId) {
    return Meteor.userId() && Meteor.userId() !== userId;
});

Template.registerHelper('slugOrId', function(question) {
    return question.slug || question._id;
});

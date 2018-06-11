import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';
import { Deps } from 'meteor/deps';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { GRADES } from '/imports/constants.js';

Template.registerHelper('isGreaterThanZero', function(value) {
    if (value > 0) {
        return true;
    }
    return false;
});

Template.registerHelper('not', function(value) {
    return !value;
});

Template.registerHelper('eq', function(value1, value2) {
    return value1 === value2;
});

Template.registerHelper('optionsSelected', function(values, defaultValue) {
    if (Array.isArray(values)) {
        return '';
    }

    return new Spacebars.SafeString(
        Object.keys(values)
            .map(key => values[key])
            .map(
                value =>
                    value === defaultValue
                        ? `<option selected>${value}</option>`
                        : `<option>${value}</option>`
            )
            .join('')
    );
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

Template.registerHelper('titleOrTrimmedQuestion', function(
    question,
    stopIndex
) {
    if (question.title && question.title.length > 1) {
        return question.title;
    }
    if (question.question.length < stopIndex) {
        return question.question;
    }
    return `${question.question.substring(0, stopIndex)}...`;
});

Template.registerHelper('grades', function() {
    return GRADES;
});

Template.registerHelper('subjectName', function(subjectId) {
    const subject = Subjects.findOne({ _id: subjectId });
    return subject ? subject.name : 'Ukjent fag';
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

Template.registerHelper('subjectList', function(subjectNames) {
    if (!subjectNames) {
        return '';
    }

    if (subjectNames.length > 1) {
        let subjectNamesStr = '';
        for (let i = 0; i < subjectNames.length - 1; i += 1) {
            subjectNamesStr += `${subjectNames[i]}, `;
        }
        return `${subjectNamesStr.substring(
            0,
            subjectNamesStr.length - 2
        )} og ${subjectNames[subjectNames.length - 1]}`;
    }
    return subjectNames.join('');
});

Template.registerHelper('slugOrId', function(question) {
    return question.slug || question._id;
});

Template.registerHelper(
    'capitalize',
    string => string.charAt(0).toUpperCase() + string.slice(1)
);

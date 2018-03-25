import { Config } from '/imports/api/config/config.js';
import { Questions } from '/imports/api/questions/questions.js';
import { StudentQueue } from '/imports/api/studentQueue/studentQueue.js';

import './home.html';

var getHighestQueueNr = function() {
    if (StudentQueue.find({}).count() === 0) {
        return 0;
    }
    return StudentQueue.find({}, { sort: { queueNr: -1 }, limit: 1 }).fetch()[0]
        .queueNr;
};

Template.getHelp.events({
    'click a#more-info': function(event) {
        $('#moreInfoModal').modal();
    }
});

Template.getHelpBox.helpers({
    openingHours: function() {
        var openingHoursArray = Config.find({ name: 'openingHours' }).fetch();

        if (openingHoursArray.length > 0) {
            return Config.find({ name: 'openingHours' }).fetch()[0].text;
        }
        return '';
    },
    serviceStatusLoaded: function() {
        return Session.get('serviceStatusLoaded');
    },
    videoHelpDisabled: function() {
        var serviceStatus = Config.findOne({ name: 'serviceStatus' });
        if (serviceStatus && serviceStatus.open) {
            return '';
        }
        return 'disabled';
    },
    subjectDisabled: function(subjectId) {
        var numberOfLoggedInUsersForSubject = Meteor.users
            .find({
                $and: [
                    { 'profile.subjects.subjectId': subjectId },
                    { 'status.online': true },
                    { 'profile.allowVideohelp': true },
                    { 'profile.firstName': { $not: 'Orkis' } }
                ]
            })
            .count();

        if (numberOfLoggedInUsersForSubject === 0) {
            return 'disabled-li';
        }
    }
});

Template.getHelpBox.events({
    'click button#start-video-session': function(event) {
        if ($('button#start-video-session').hasClass('disabled')) {
            return;
        }

        var chosenSubject = $('#chosen-subject')
            .text()
            .trim();
        var chosenGrade = $('#chosen-grade')
            .text()
            .trim();

        validationError = [];
        validationErrorDep.changed();
        if (chosenSubject === 'Velg fag') {
            validationError.push('subjectError');
            validationErrorDep.changed();
        }
        if (chosenGrade === 'Velg trinn') {
            validationError.push('gradeError');
            validationErrorDep.changed();
        }
        if (validationError.length === 0) {
            mixpanel.track('Bedt om leksehjelp', {
                fag: chosenSubject,
                trinn: chosenGrade
            });
            Meteor.call(
                'createSessionOnServer',
                {
                    subject: chosenSubject,
                    grade: chosenGrade,
                    queueNr: getHighestQueueNr()
                },
                function(error, sessionId) {
                    if (error) {
                        validationError.push('sessionError');
                        validationErrorDep.changed();
                    } else {
                        Session.set('studentSessionId', sessionId);
                        Session.set('queueStartTime', new Date().getTime());
                        $('#queueModal').modal({
                            backdrop: 'static',
                            keyboard: false
                        });
                    }
                }
            );
        }
    },

    'click .disabled-li': function(event) {
        event.preventDefault();
        return false;
    },

    'click .subjects': function(event) {
        if (!$(event.target).hasClass('disabled-li')) {
            $('#chosen-subject').text(this.name);
        }
    },

    'click .grades': function() {
        $('#chosen-grade').text(this);
    }
});

Template.previousQuestions.helpers({
    previousQuestions: function(skip, limit) {
        return Questions.find(
            {},
            { sort: { questionDate: -1 }, skip: skip, limit: limit }
        );
    },
    numberOfQuestions: function() {
        var numberOfQuestions = Session.get('numberOfQuestions');
        if (numberOfQuestions) {
            return ' (' + numberOfQuestions + ')';
        }
    }
});

Template.previousQuestions.events({
    'click button#ask-question': function() {
        Router.go('askQuestion');
    }
});

Template.todaysVolunteers.helpers({
    todaysVolunteers: function() {
        return Meteor.users
            .find({
                $and: [
                    { 'status.online': true },
                    { 'profile.firstName': { $not: 'Orkis' } },
                    { 'profile.subjects.0': { $exists: true } },
                    { 'profile.allowVideohelp': true }
                ]
            })
            .fetch();
    }
});

Template.otherActivities.events({
    'click a.textLink': function(event) {
        mixpanel.track('Andre aktiviteter', { url: event.currentTarget.href });
    }
});

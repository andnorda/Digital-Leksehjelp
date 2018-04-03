import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import mixpanel from '/imports/mixpanel';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { Config } from '/imports/api/config/config.js';
import { Questions } from '/imports/api/questions/questions.js';

import './home.html';

Template.getHelpBox.onCreated(function getHelpBoxOnCreated() {
    this.autorun(() => {
        this.subscribe('subjects');
        this.subscribe('users.loggedIn');
        this.subscribe('config.openingHours');

        Session.set('serviceStatusLoaded', false);
        this.subscribe('config.serviceStatus', function onComplete() {
            Session.set('serviceStatusLoaded', true);
        });
    });
});

Template.getHelp.events({
    'click a#more-info'() {
        $('#moreInfoModal').modal();
    }
});

Template.getHelpBox.helpers({
    subjects() {
        return Subjects.find({}, { sort: { name: 1 } });
    },
    serviceIsOpen() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus ? serviceStatus.open : false;
    },
    openingHours() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        return openingHours ? openingHours.text : '';
    },
    serviceStatusLoaded() {
        return Session.get('serviceStatusLoaded');
    },
    subjectDisabled(subjectId) {
        const numberOfLoggedInUsersForSubject = Meteor.users
            .find({
                $and: [
                    { 'profile.subjects.subjectId': subjectId },
                    { 'status.online': true },
                    { 'profile.allowVideohelp': true },
                    { 'profile.firstName': { $not: 'Orkis' } }
                ]
            })
            .count();

        return numberOfLoggedInUsersForSubject === 0 ? 'disabled-li' : '';
    }
});

Template.getHelpBox.events({
    'click button#start-video-session'() {
        if ($('button#start-video-session').hasClass('disabled')) {
            return;
        }

        const chosenSubject = $('#chosen-subject')
            .text()
            .trim();
        const chosenGrade = $('#chosen-grade')
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
                'studentSessions.create',
                {
                    subject: chosenSubject,
                    grade: chosenGrade
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

    'click .disabled-li'(event) {
        event.preventDefault();
        return false;
    },

    'click .subjects'(event) {
        if (!$(event.target).hasClass('disabled-li')) {
            $('#chosen-subject').text(this.name);
        }
    },

    'click .grades'() {
        $('#chosen-grade').text(this);
    }
});

Template.previousQuestions.onCreated(function previousQuestionsOnCreated() {
    this.autorun(() => {
        this.subscribe('questions.search', {
            sort: 'date',
            limit: 6
        });
    });

    Meteor.call('questions.searchCount', {}, function(error, result) {
        Session.set('numberOfQuestions', result);
    });
});

Template.previousQuestions.helpers({
    previousQuestions(skip, limit) {
        return Questions.find({}, { sort: { questionDate: -1 }, skip, limit });
    },
    numberOfQuestions() {
        const numberOfQuestions = Session.get('numberOfQuestions');
        return numberOfQuestions ? ` (${numberOfQuestions})` : '';
    }
});

Template.previousQuestions.events({
    'click button#ask-question'() {
        Router.go('askQuestion');
    }
});

Template.todaysVolunteers.onCreated(function todaysVolunteersOnCreated() {
    this.autorun(() => {
        this.subscribe('users.loggedIn');
    });
});

Template.todaysVolunteers.helpers({
    serviceIsOpen() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus ? serviceStatus.open : false;
    },
    todaysVolunteers() {
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
    'click a.textLink'(event) {
        mixpanel.track('Andre aktiviteter', { url: event.currentTarget.href });
    }
});

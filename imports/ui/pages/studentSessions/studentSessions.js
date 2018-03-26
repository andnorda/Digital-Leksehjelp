import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import { $ } from 'meteor/jquery';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Config } from '/imports/api/config/config.js';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { timeSince } from '/imports/utils.js';

import { STUDENT_SESSION_STATE } from '/imports/constants';

import './studentSessions.html';

import '../../components/serviceStatus/serviceStatus.js';

Template.studentSessionsTable.onCreated(function() {
    this.autorun(() => {
        this.subscribe('studentSessions');
    });
});

Template.studentSessionsTable.helpers({
    myStudentSessions() {
        const query = {
            $or: []
        };
        const { profile: { subjects } } = Meteor.user();
        for (let i = 0; i < subjects.length; i += 1) {
            query.$or.push({ subject: subjects[i].subjectName });
        }

        if (query.$or.length === 0) {
            return null;
        }
        return StudentSessions.find(query);
    },
    otherStudentSessions() {
        const query = {
            $and: []
        };
        const { profile: { subjects } } = Meteor.user();
        for (let i = 0; i < subjects.length; i += 1) {
            query.$and.push({ subject: { $ne: subjects[i].subjectName } });
        }

        if (query.$and.length === 0) {
            return null;
        }
        return StudentSessions.find(query);
    }
});

let interval;

Template.studentSessionRow.onCreated(function() {
    this.state = new ReactiveDict();
    interval = Meteor.setInterval(() => {
        this.state.set('time', new Date());
    }, 1000);
});

Template.studentSessionRow.onDestroyed(function() {
    Meteor.clearInterval(interval);
});

Template.studentSessionRow.helpers({
    timeInQueue() {
        return timeSince(
            this.createdAt,
            Template.instance().state.get('time') || new Date()
        );
    }
});

Template.studentSessionRow.events({
    'click .startTutoring'() {
        Session.set('startTutoringTime', new Date().getTime());
        window.open(this.videoConferenceUrl, '_blank');
        const sessionId = this._id;
        Meteor.call(
            'studentSessions.setState',
            {
                sessionId,
                state: STUDENT_SESSION_STATE.READY,
                tutor: Meteor.user().profile.firstName
            },
            function() {
                Session.set('studentSessionId', sessionId);
                $('#endSessionModal').modal();
            }
        );
    },

    'click .deleteSession'() {
        Meteor.call('studentSessions.remove', {
            sessionId: this._id
        });
    }
});

Template.openService.onCreated(function openServiceOnCreated() {
    this.autorun(() => {
        this.subscribe('config.serviceStatus');
    });
});

Template.openService.helpers({
    serviceIsOpen() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus ? serviceStatus.open : false;
    }
});

Template.openService.events({
    'click button#openService'() {
        Meteor.call('config.openService', function(error) {
            if (error) {
                FlashMessages.sendError(error.message);
            }
        });
    }
});

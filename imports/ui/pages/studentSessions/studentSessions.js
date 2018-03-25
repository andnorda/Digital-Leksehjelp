import { Config } from '/imports/api/config/config.js';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';

import { STUDENT_SESSION_STATE } from '/imports/constants';

import './studentSessions.html';

import '../../components/serviceStatus/serviceStatus.js';

Meteor.setInterval(function() {
    Session.set('time', new Date());
}, 1000);

Template.studentSessionsTable.helpers({
    myStudentSessions: function() {
        var query = {
            $or: []
        };
        var subjects = Meteor.user().profile.subjects;
        for (var i = 0; i < subjects.length; i++) {
            query.$or.push({ subject: subjects[i].subjectName });
        }

        if (query.$or.length === 0) {
            return null;
        } else {
            return StudentSessions.find(query);
        }
    },
    otherStudentSessions: function() {
        var query = {
            $and: []
        };
        var subjects = Meteor.user().profile.subjects;
        for (var i = 0; i < subjects.length; i++) {
            query.$and.push({ subject: { $ne: subjects[i].subjectName } });
        }

        if (query.$and.length === 0) {
            return null;
        } else {
            return StudentSessions.find(query);
        }
    }
});

Template.studentSessionRow.helpers({
    time: function() {
        return Session.get('time') || new Date();
    }
});

Template.studentSessionRow.events({
    'click .startTutoring': function() {
        Session.set('startTutoringTime', new Date().getTime());
        window.open(this.videoConferenceUrl, '_blank');
        var sessionId = this._id;
        Meteor.call(
            'studentSessions.setState',
            {
                sessionId: sessionId,
                state: STUDENT_SESSION_STATE.READY,
                tutor: Meteor.user().profile.firstName
            },
            function() {
                Session.set('studentSessionId', sessionId);
                $('#endSessionModal').modal();
            }
        );
    },

    'click .deleteSession': function() {
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
    serviceIsOpen: function() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus ? serviceStatus.open : false;
    }
});

Template.openService.events({
    'click button#openService': function() {
        Meteor.call('config.openService', function(error, data) {
            if (error) {
                FlashMessages.sendError(error.message);
            }
        });
    }
});

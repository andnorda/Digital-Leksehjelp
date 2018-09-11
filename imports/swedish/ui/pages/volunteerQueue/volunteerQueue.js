import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { timeSince } from '/imports/utils.js';
import mixpanel from '/imports/mixpanel.js';
import { getQueueTime } from '/imports/utils.js';
import { STUDENT_SESSION_STATE } from '/imports/constants';
import '../../components/tagList/tagList.js';

import './volunteerQueue.html';
import './volunteerQueue.less';

Template.volunteerQueue.onCreated(function() {
    this.autorun(() => {
        this.subscribe('studentSessions');
        this.subscribe('users.self');
    });
});

Template.volunteerQueue.helpers({
    mySubjectsQueue() {
        const { subjects = [] } = Meteor.user() || {};
        return (
            subjects.length &&
            StudentSessions.find({
                subject: { $in: subjects },
                state: STUDENT_SESSION_STATE.WAITING
            })
        );
    },
    mySubjectsActiveSessions() {
        const { subjects = [] } = Meteor.user() || {};
        return (
            subjects.length &&
            StudentSessions.find({
                subject: { $in: subjects },
                $or: [
                    { state: STUDENT_SESSION_STATE.READY },
                    { state: STUDENT_SESSION_STATE.GETTING_HELP }
                ]
            })
        );
    },
    otherSubjectsQueue() {
        const { subjects = [] } = Meteor.user() || {};
        return StudentSessions.find(
            subjects.length
                ? {
                      subject: { $nin: subjects },
                      state: STUDENT_SESSION_STATE.WAITING
                  }
                : { state: STUDENT_SESSION_STATE.WAITING }
        );
    },
    otherSubjectsActiveSessions() {
        const { subjects = [] } = Meteor.user() || {};
        return StudentSessions.find(
            subjects.length
                ? {
                      subject: { $nin: subjects },
                      $or: [
                          { state: STUDENT_SESSION_STATE.READY },
                          { state: STUDENT_SESSION_STATE.GETTING_HELP }
                      ]
                  }
                : {
                      $or: [
                          { state: STUDENT_SESSION_STATE.READY },
                          { state: STUDENT_SESSION_STATE.GETTING_HELP }
                      ]
                  }
        );
    },
    hasStudentsInQueue() {
        return (
            StudentSessions.find({
                state: STUDENT_SESSION_STATE.WAITING
            }).count() > 0
        );
    },
    hasActiveStudents() {
        return (
            StudentSessions.find({
                $or: [
                    { state: STUDENT_SESSION_STATE.READY },
                    { state: STUDENT_SESSION_STATE.GETTING_HELP }
                ]
            }).count() > 0
        );
    }
});

Template.studentSession.onCreated(function() {
    this.state = new ReactiveDict();
    interval = Meteor.setInterval(() => {
        this.state.set('time', new Date());
    }, 1000);
});

Template.studentSession.helpers({
    timeInQueue() {
        return timeSince(
            this.createdAt,
            Template.instance().state.get('time') || new Date()
        );
    },
    isVideo() {
        return this.type === 'video';
    },
    text() {
        return this.text && this.text.length > 256
            ? `${this.text.substring(0, 256)}...`
            : this.text;
    },
    buttonText() {
        return this.type === 'video' ? 'Starta videochatt' : 'Starta chatt';
    },
    startTutoring() {
        const sessionId = this._id;
        return () => {
            Session.set('startTutoringTime', new Date().getTime());
            Meteor.call('studentSessions.startTutoring', sessionId);

            if (this.type === 'video') {
                window.open(this.videoConferenceUrl);
                Session.set('studentSessionId', sessionId);
                $('#endSessionModal').modal();
            } else {
                Router.go(`/frivillig/chat/${sessionId}`);
            }
        };
    },

    deleteSession() {
        const sessionId = this._id;
        return () => {
            if (
                confirm('Är du säker på att du vill ta bort eleven från kön?')
            ) {
                Meteor.call('studentSessions.delete', sessionId);
            }
        };
    }
});

Template.activeStudentSession.onCreated(function() {
    this.state = new ReactiveDict();
    interval = Meteor.setInterval(() => {
        this.state.set('time', new Date());
    }, 1000);
    this.autorun(() => {
        this.subscribe('users');
    });
});

Template.activeStudentSession.helpers({
    timeTutoring() {
        return timeSince(
            this.startedTutoringAt,
            Template.instance().state.get('time') || new Date()
        );
    },
    isVideo() {
        return this.type === 'video';
    },
    volunteers() {
        return this.volunteers
            .map(({ id }) => Meteor.users.findOne(id))
            .filter(user => user)
            .map(user => user.profile.firstName)
            .join(', ');
    },
    buttonText() {
        return this.type === 'video' ? 'Öppna videochatt' : 'Öppna chatt';
    },
    startTutoring() {
        const sessionId = this._id;
        const url = this.videoConferenceUrl;
        const type = this.type;
        return () => {
            Meteor.call(
                'studentSessions.addVolunteer',
                sessionId,
                Meteor.userId()
            );
            if (type === 'video') {
                window.open(url);
            } else {
                Router.go(`/frivillig/chat/${sessionId}`);
            }
        };
    },
    deleteSession() {
        const sessionId = this._id;
        return () => {
            if (confirm('Är du säker på att du vill sluta läxhjälpen?')) {
                Meteor.call('studentSessions.endTutoring', sessionId);
            }
        };
    }
});

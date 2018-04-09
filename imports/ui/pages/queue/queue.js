import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { timeSince } from '/imports/utils.js';
import { STUDENT_SESSION_STATE } from '/imports/constants';

import './queue.html';

Template.queue.onCreated(function() {
    this.autorun(() => {
        this.subscribe('studentSessions');
    });
});

Template.queue.helpers({
    queueInMySubjects() {
        const { profile: { subjects = [] } } = Meteor.user();
        return StudentSessions.find({
            $or: subjects.map(subject => ({ subject: subject.subjectName })),
            state: STUDENT_SESSION_STATE.WAITING
        });
    },
    queueInOtherSubjects() {
        const { profile: { subjects = [] } } = Meteor.user();
        return StudentSessions.find({
            $and: subjects.map(subject => ({
                subject: { $ne: subject.subjectName }
            })),
            state: STUDENT_SESSION_STATE.WAITING
        });
    },
    activeInMySubjects() {
        const { profile: { subjects = [] } } = Meteor.user();
        return StudentSessions.find({
            $and: [
                {
                    $or: subjects.map(subject => ({
                        subject: subject.subjectName
                    }))
                },
                {
                    $or: [
                        { state: STUDENT_SESSION_STATE.READY },
                        { state: STUDENT_SESSION_STATE.GETTING_HELP }
                    ]
                }
            ]
        });
    },
    activeInOtherSubjects() {
        const { profile: { subjects = [] } } = Meteor.user();
        return StudentSessions.find({
            $and: subjects.map(subject => ({
                subject: { $ne: subject.subjectName }
            })),
            $or: [
                { state: STUDENT_SESSION_STATE.READY },
                { state: STUDENT_SESSION_STATE.GETTING_HELP }
            ]
        });
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

Template.queuingStudentSession.onCreated(function() {
    this.state = new ReactiveDict();
    interval = Meteor.setInterval(() => {
        this.state.set('time', new Date());
    }, 1000);
});

Template.queuingStudentSession.helpers({
    timeInQueue() {
        return timeSince(
            this.createdAt,
            Template.instance().state.get('time') || new Date()
        );
    }
});

Template.queuingStudentSession.events({
    'click button.startTutoring'() {
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

    'click button.deleteSession'() {
        Meteor.call('studentSessions.remove', { sessionId: this._id });
    }
});

Template.activeStudentSession.events({
    'click button.deleteSession'() {
        Meteor.call('studentSessions.remove', { sessionId: this._id });
    }
});

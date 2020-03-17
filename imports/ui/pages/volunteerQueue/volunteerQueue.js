import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { differenceInMilliseconds } from 'date-fns';
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
        const { subjects = [], helpTopics = [] } = Meteor.user();
        return (
            subjects.length &&
            StudentSessions.find({
                $or: subjects
                    .map(subject => ({ subject }))
                    .concat(
                        helpTopics.map(helpTopic => ({ subject: helpTopic }))
                    ),
                state: STUDENT_SESSION_STATE.WAITING
            })
        );
    },
    otherSubjectsQueue() {
        const { subjects = [], helpTopics = [] } = Meteor.user();
        return StudentSessions.find(
            subjects.length
                ? {
                    $and: subjects
                        .map(subject => ({
                            subject: { $ne: subject }
                        }))
                        .concat(
                            helpTopics.map(helpTopic => ({
                                subject: { $ne: helpTopic }
                            }))
                        ),
                    state: STUDENT_SESSION_STATE.WAITING
                }
                : { state: STUDENT_SESSION_STATE.WAITING }
        );
    },
    activeSessions() {
        const {
            profile: { subjects = [] }
        } = Meteor.user();
        return StudentSessions.find({
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
    }
});

Template.studentSession.events({
    'click button.startTutoring'() {
        Session.set('startTutoringTime', new Date().getTime());
        const sessionId = this._id;
        Meteor.call('studentSessions.startTutoring', sessionId);
        mixpanel.track('Start leksehjelp', {
            sekunderIKø: Math.floor(
                ((new Date() - this.createdAt) / 1000) % 60
            ),
            type: this.type,
            fag: this.subject,
            trinn: this.grade,
            tema: this.topics
        });

        if (this.type === 'video') {
            window.open(this.videoConferenceUrl);
            Session.set('studentSessionId', sessionId);
            $('#endSessionModal').modal();
        } else {
            Router.go(`/frivillig/chat/${this._id}`);
        }
    },

    'click button.deleteSession'() {
        if (confirm('Er du sikker på at du vil fjerne eleven fra køen?')) {
            Meteor.call('studentSessions.delete', this._id);
            mixpanel.track('Fjernet fra køen av frivillig', {
                type: this.type
            });
        }
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
    }
});

Template.activeStudentSession.events({
    'click button.startTutoring'() {
        Meteor.call('studentSessions.addVolunteer', this._id, Meteor.userId());
        if (this.type === 'video') {
            window.open(this.videoConferenceUrl);
        } else {
            Router.go(`/frivillig/chat/${this._id}`);
        }
    },

    'click button.deleteSession'() {
        if (confirm('Er du sikker på at du vil avslutte leksehjelpen?')) {
            const helpDurationMinutes = getQueueTime(
                Session.get('startTutoringTime')
            );
            if (helpDurationMinutes > 4) {
                mixpanel.track('Hjulpet elev', {
                    'Minutter i samtale': helpDurationMinutes,
                    type: this.type
                });
            }

            $('#helpEndedForm').modal();

            Session.set('studentSessionId', this._id);
            Meteor.call('studentSessions.endTutoring', this._id);
        }
    }
});

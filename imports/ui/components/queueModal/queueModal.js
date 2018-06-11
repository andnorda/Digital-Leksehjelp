import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { timeSince, getQueueTime } from '/imports/utils.js';
import mixpanel from '/imports/mixpanel.js';
import { STUDENT_SESSION_STATE } from '/imports/constants';

import './queueModal.html';

Meteor.setInterval(function() {
    Session.set('time', new Date());
}, 1000);

Template.queueModal.onCreated(function queueModalOnCreated() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('studentSessions.byId', Session.get('studentSessionId'));

        const state = (findStudentSession() || {}).state;

        if (
            this.state.get('prevState') === STUDENT_SESSION_STATE.WAITING &&
            (state === STUDENT_SESSION_STATE.READY ||
                state === STUDENT_SESSION_STATE.GETTING_HELP)
        ) {
            window.Notification && new Notification('Leksehjelpen er klar!');
        }
        this.state.set('prevState', state);
    });
});

const findStudentSession = () =>
    StudentSessions.findOne({ _id: Session.get('studentSessionId') });

Template.queueModal.events({
    'click a#leave-queue'() {
        Meteor.call('studentSessions.delete', Session.get('studentSessionId'));

        mixpanel.track('Forlot leksehjelp-kø', {
            'Minutter i kø': getQueueTime(Session.get('queueStartTime')),
            type: 'video'
        });

        window.showSurvey();
    },
    'input textarea[name=question]'(event) {
        Meteor.call('studentSessions.updateText', {
            sessionId: Session.get('studentSessionId'),
            text: event.target.value
        });
    }
});

Template.queueModalBody.onCreated(function queueModalBodyOnCreated() {
    this.autorun(() => {
        this.subscribe('studentSessions.byId', Session.get('studentSessionId'));
    });
});

Template.queueModalBody.helpers({
    timeInQueue() {
        return timeSince(this.createdAt, Session.get('time') || new Date());
    },
    studentSession() {
        return findStudentSession();
    },
    stateWaiting() {
        const studentSession = findStudentSession();
        return (
            studentSession &&
            studentSession.state === STUDENT_SESSION_STATE.WAITING
        );
    },
    stateReady() {
        const studentSession = findStudentSession();
        return (
            studentSession &&
            studentSession.state === STUDENT_SESSION_STATE.READY
        );
    },
    isVideo() {
        return findStudentSession().type === 'video';
    }
});

Template.queueModalBody.events({
    'click button#getHelp'() {
        mixpanel.track('Fullført kø, og gått til rom', {
            'Minutter i kø': getQueueTime(Session.get('queueStartTime'))
        });

        if (this.type === 'video') {
            window.open(this.videoConferenceUrl);
        } else {
            Router.go(`/chat/${this._id}`);
        }

        Meteor.call('studentSessions.getHelp', Session.get('studentSessionId'));
    }
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { timeSince, getQueueTime } from '/imports/utils.js';
import mixpanel from '/imports/mixpanel.js';

import { STUDENT_SESSION_STATE } from '/imports/constants';

import {
    flashTitle,
    cancelFlashTitle
} from '/imports/startup/client/flashTitle.js';

import './queueModal.html';

Meteor.setInterval(function() {
    Session.set('time', new Date());
}, 1000);

Template.queueModal.onCreated(function queueModalOnCreated() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('studentSessions.byId', Session.get('studentSessionId'));

        if (
            this.state.get('prevState') === STUDENT_SESSION_STATE.READY &&
            (findStudentSession() || {}).state === STUDENT_SESSION_STATE.READY
        ) {
            window.Notification && new Notification('Leksehjelpen er klar!');
        }
        this.state.set('prevState', (findStudentSession() || {}).state);
    });
});

const findStudentSession = () =>
    StudentSessions.findOne({ _id: Session.get('studentSessionId') });

Template.queueModal.onRendered(function() {
    const elem = $('#queueModal')[0];
    const data = $.hasData(elem) && $._data(elem);

    if (data && data.events) {
        if (!data.events.hidden) {
            $('#queueModal').on('hidden.bs.modal', function() {
                const session = findStudentSession();
                if (
                    session &&
                    session.state !== STUDENT_SESSION_STATE.GETTING_HELP
                ) {
                    mixpanel.track('Forlot leksehjelp-kø', {
                        'Minutter i kø': getQueueTime(
                            Session.get('queueStartTime')
                        )
                    });
                    Meteor.call('studentSessions.remove', {
                        sessionId: Session.get('studentSessionId')
                    });
                }
                $(this).off('hidden.bs.modal');
            });
        }
    }
});

Template.queueModal.events({
    'click a#leave-queue'() {
        Meteor.call('studentSessions.remove', {
            sessionId: Session.get('studentSessionId')
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
        const stateReady =
            studentSession &&
            studentSession.state === STUDENT_SESSION_STATE.READY;
        if (stateReady) {
            flashTitle('Leksehjelpen er klar!', 20);
        }
        return stateReady;
    }
});

Template.queueModalBody.events({
    'click button#getHelp'() {
        mixpanel.track('Fullført kø, og gått til rom', {
            'Minutter i kø': getQueueTime(Session.get('queueStartTime'))
        });
        window.open(this.videoConferenceUrl);

        Meteor.call('studentSessions.setState', {
            sessionId: Session.get('studentSessionId'),
            state: STUDENT_SESSION_STATE.GETTING_HELP
        });

        cancelFlashTitle();
    }
});

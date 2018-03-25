import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { StudentQueue } from '/imports/api/studentQueue/studentQueue.js';

import { STUDENT_SESSION_STATE } from '/imports/constants';

import {
    flashTitle,
    cancelFlashTitle
} from '/imports/startup/client/flashTitle.js';

import './queueModal.html';

Template.queueModal.rendered = function() {
    var elem = $('#queueModal')[0];
    var data = $.hasData(elem) && $._data(elem);

    if (data && data.events) {
        if (!data.events.hidden) {
            $('#queueModal').on('hidden.bs.modal', function() {
                var session = findStudentSession();
                if (
                    session &&
                    session.state !== STUDENT_SESSION_STATE.GETTING_HELP
                ) {
                    mixpanel.track('Forlot leksehjelp-kø', {
                        'Minutter i kø': DigitalLeksehjelp.getQueueTime(
                            Session.get('queueStartTime'),
                            'minutes'
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
};

var findStudentSession = function() {
    return StudentSessions.findOne({ _id: Session.get('studentSessionId') });
};

Template.queueModal.events({
    'click a#leave-queue': function() {
        Meteor.call('studentSessions.remove', {
            sessionId: Session.get('studentSessionId')
        });

        window.showSurvey();
    }
});

Template.queueModalBody.helpers({
    studentSession: function() {
        return findStudentSession();
    },
    stateWaiting: function() {
        var studentSession = findStudentSession();
        return (
            studentSession &&
            studentSession.state == STUDENT_SESSION_STATE.WAITING
        );
    },
    studentsInFront: function() {
        var studentSession = findStudentSession();
        var nrOfStudents = StudentQueue.find({
            $and: [
                { queueNr: { $lt: studentSession.queueNr } },
                { subject: studentSession.subject }
            ]
        }).count();
        return nrOfStudents + 1;
    },
    stateReady: function() {
        var studentSession = findStudentSession();
        var stateReady =
            studentSession &&
            studentSession.state == STUDENT_SESSION_STATE.READY;
        if (stateReady) {
            flashTitle('Leksehjelpen er klar!', 20);
        }
        return stateReady;
    }
});

Template.queueModalBody.events({
    'click button#getHelp': function() {
        mixpanel.track('Fullført kø, og gått til rom', {
            'Minutter i kø': DigitalLeksehjelp.getQueueTime(
                Session.get('queueStartTime'),
                'minutes'
            )
        });
        window.open(this.videoConferenceUrl);

        Meteor.call('studentSessions.setState', {
            sessionId: Session.get('studentSessionId'),
            state: STUDENT_SESSION_STATE.GETTING_HELP
        });

        cancelFlashTitle();
    }
});

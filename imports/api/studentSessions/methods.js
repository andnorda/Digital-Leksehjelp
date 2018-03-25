import { StudentSessions } from './studentSessions.js';

import { STUDENT_SESSION_STATE } from '/imports/constants.js';

var generateRandomAppearInLink = function() {
    var randomId = Math.floor(Math.random() * 1000000000);
    return 'http://appear.in/' + randomId;
};

Meteor.methods({
    'studentSessions.remove'(options) {
        check(options.sessionId, String);

        StudentSessions.remove({ _id: options.sessionId });
    },

    'studentSessions.setState'(options) {
        check(options.sessionId, String);

        var updateDoc;
        if (!options.tutor) {
            updateDoc = { $set: { state: options.state } };
        } else {
            updateDoc = {
                $set: { state: options.state, tutor: options.tutor }
            };
        }

        StudentSessions.update({ _id: options.sessionId }, updateDoc);
    },

    'studentSessions.create'(options) {
        check(options.subject, String);
        check(options.grade, String);
        check(options.queueNr, Number);

        var queueNr = options.queueNr + 1;
        var videoConferenceUrl = generateRandomAppearInLink();

        return StudentSessions.insert({
            subject: options.subject,
            grade: options.grade,
            videoConferenceUrl: videoConferenceUrl,
            state: STUDENT_SESSION_STATE.WAITING,
            queueNr: queueNr,
            createdAt: new Date()
        });
    }
});

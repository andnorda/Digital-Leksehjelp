import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { STUDENT_SESSION_STATE } from '/imports/constants.js';
import { StudentSessions } from './studentSessions.js';

const generateRandomAppearInLink = function() {
    const randomId = Math.floor(Math.random() * 1000000000);
    return `http://appear.in/${randomId}`;
};

Meteor.methods({
    'studentSessions.remove'(options) {
        check(options.sessionId, String);

        StudentSessions.remove({ _id: options.sessionId });
    },

    'studentSessions.setState'(options) {
        check(options.sessionId, String);

        let updateDoc;
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

        const videoConferenceUrl = generateRandomAppearInLink();

        return StudentSessions.insert({
            subject: options.subject,
            grade: options.grade,
            videoConferenceUrl,
            state: STUDENT_SESSION_STATE.WAITING,
            createdAt: new Date()
        });
    },

    'studentSessions.updateText'({ sessionId, text }) {
        check(sessionId, String);
        check(text, String);

        StudentSessions.update({ _id: sessionId }, { $set: { text } });
    }
});

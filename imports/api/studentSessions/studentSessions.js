import { Mongo } from 'meteor/mongo';

import { STUDENT_SESSION_STATE } from '/imports/constants';

export const StudentSessions = new Mongo.Collection('sessions');

StudentSessionsSchema = new SimpleSchema({
    subject: {
        type: String
    },
    grade: {
        type: String
    },
    videoConferenceUrl: {
        type: String,
        regEx: SimpleSchema.RegEx.Url
    },
    state: {
        type: String,
        allowedValues: Object.keys(STUDENT_SESSION_STATE).map(function(key) {
            return STUDENT_SESSION_STATE[key];
        })
    },
    queueNr: {
        type: Number
    },
    tutor: {
        type: String,
        optional: true
    },
    createdAt: {
        type: Date
    }
});

StudentSessions.attachSchema(StudentSessionsSchema);
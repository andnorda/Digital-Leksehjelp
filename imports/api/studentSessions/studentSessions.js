import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { STUDENT_SESSION_STATE } from '/imports/constants';

export const StudentSessions = new Mongo.Collection('sessions');

const StudentSessionsSchema = new SimpleSchema({
    subject: {
        type: String
    },
    grade: {
        type: String
    },
    type: {
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
    'volunteers.$.id': {
        type: String,
        optional: true
    },
    'volunteers.$.unread': {
        type: Number,
        optional: true
    },
    createdAt: {
        type: Date
    },
    'temp.text': {
        type: String,
        optional: true
    },
    text: {
        type: String,
        optional: true
    },
    nickname: {
        type: String
    }
});

StudentSessions.attachSchema(StudentSessionsSchema);

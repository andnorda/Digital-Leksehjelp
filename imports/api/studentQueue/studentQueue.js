import { Mongo } from 'meteor/mongo';

export const StudentQueue = new Mongo.Collection('student-queue');

StudentQueueSchema = new SimpleSchema({
    queueNr: {
        type: Number
    },
    subject: {
        type: String
    }
});

StudentQueue.attachSchema(StudentQueueSchema);

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Feedback = new Mongo.Collection('feedback');

const FeedbackSchema = new SimpleSchema({
    feedback: {
        type: String
    },
    questionId: {
        type: String
    },
    createdAt: {
        type: Date
    }
});

Feedback.attachSchema(FeedbackSchema);

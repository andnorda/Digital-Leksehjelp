import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Messages = new Mongo.Collection('messages');

const MessagesSchema = new SimpleSchema({
    message: {
        type: String
    },
    author: {
        type: String,
        optional: true
    },
    sessionId: {
        type: String
    },
    type: {
        type: String,
        optional: true
    },
    url: {
        type: String,
        optional: true
    },
    size: {
        type: Number,
        optional: true
    },
    createdAt: {
        type: Date
    }
});

Messages.attachSchema(MessagesSchema);

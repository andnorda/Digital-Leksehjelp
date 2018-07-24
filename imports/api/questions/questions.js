import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { GRADES } from '/imports/constants.js';

export const Questions = new Mongo.Collection('questions');

const QuestionsSchema = new SimpleSchema({
    question: {
        type: String
    },
    questionDate: {
        type: Date
    },
    subject: {
        type: String
    },
    grade: {
        type: String,
        allowedValues: GRADES
    },
    studentEmail: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        optional: true
    },
    'attachments.$.url': {
        type: String
    },
    'attachments.$.name': {
        type: String
    },
    'answerAttachments.$.url': {
        type: String
    },
    'answerAttachments.$.name': {
        type: String
    },
    'editedBy.$.id': {
        type: String
    },
    'editedBy.$.date': {
        type: Date
    },
    title: {
        type: String,
        optional: true
    },
    slug: {
        type: String,
        index: true,
        unique: true,
        optional: true
    },
    answer: {
        type: String,
        optional: true
    },
    approvedBy: {
        type: String,
        optional: true
    },
    submittedForApprovalBy: {
        type: String,
        optional: true
    },
    publishedBy: {
        type: String,
        optional: true
    },
    editing: {
        type: [String],
        optional: true
    },
    topics: {
        type: [String],
        optional: true
    },
    allowPublish: {
        type: Boolean,
        optional: true
    },
    nickname: {
        type: String,
        optional: true
    }
});

Questions.attachSchema(QuestionsSchema);

export const questionPublicFields = {
    answer: true,
    grade: true,
    question: true,
    title: true,
    questionDate: true,
    subject: true,
    slug: true,
    attachments: true,
    answerAttachments: true,
    topics: true,
    nickname: true
};

export const questionPrivateFields = {
    studentEmail: false
};

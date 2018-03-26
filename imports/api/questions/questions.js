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
    subjectId: {
        type: String
    },
    grade: {
        type: String,
        allowedValues: GRADES.concat(['Ukjent'])
    },
    studentEmail: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        optional: true
    },
    attachmentUrl: {
        type: String,
        optional: true
    },
    answerAttachmentUrl: {
        type: String,
        optional: true
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
    answerDate: {
        type: Date,
        optional: true
    },
    answeredBy: {
        type: String,
        optional: true
    },
    verifiedBy: {
        type: String,
        optional: true
    },
    publishedBy: {
        type: String,
        optional: true
    },
    lastUpdatedBy: {
        type: String,
        optional: true
    },
    lastUpdatedDate: {
        type: Date,
        optional: true
    },
    editing: {
        type: [String],
        optional: true
    }
});

Questions.attachSchema(QuestionsSchema);

export const questionPublicFields = {
    answer: true,
    answerDate: true,
    answerAttachmentUrl: true,
    grade: true,
    question: true,
    questionDate: true,
    subjectId: true,
    title: true,
    slug: true
};

export const questionPrivateFields = {
    studentEmail: false
};

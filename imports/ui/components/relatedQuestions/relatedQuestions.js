import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { CONSTANTS } from '/imports/constants.js';
import { Subjects } from '/imports/api/subjects/subjects.js';

import './relatedQuestions.html';

let lastSearchForRelatedQuestionsTimestamp = 0;

searchForRelatedQuestions = function(subject, question) {
    if (
        Date.now() - lastSearchForRelatedQuestionsTimestamp <
        CONSTANTS.RELATED_QUESTION_SEARCH_THRESHOLD
    ) {
        return;
    }
    lastSearchForRelatedQuestionsTimestamp = Date.now();

    const query = {};
    if (subject) {
        query.subject = subject.name;
    }
    if (
        question.length > CONSTANTS.RELATED_QUESTION_SEARCH_MIN_QUESTION_LENGTH
    ) {
        query.q = question;
    }

    if (Object.keys(query).length > 0) {
        Meteor.call('questions.related', query, function(error, result) {
            Session.set('relatedQuestions', result);
        });
    } else {
        Session.set('relatedQuestions', []);
    }
};

Template.relatedQuestions.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.relatedQuestions.helpers({
    hasRelatedQuestions() {
        return (Session.get('relatedQuestions') || []).length > 0;
    },
    relatedQuestions() {
        return Session.get('relatedQuestions') || [];
    }
});

Template.relatedQuestionItem.helpers({
    subjectName(subjectId) {
        const subject = Subjects.findOne({ _id: subjectId });
        return subject ? subject.name : 'Ukjent fag';
    }
});

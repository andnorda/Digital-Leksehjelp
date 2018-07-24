import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { CONSTANTS } from '/imports/constants.js';
import { Subjects } from '/imports/api/subjects/subjects.js';
import '../questionList/questionList.js';

import './relatedQuestions.html';
import './relatedQuestions.less';

let lastSearchForRelatedQuestionsTimestamp = 0;

searchForRelatedQuestions = function(subject, question, state) {
    if (
        Date.now() - lastSearchForRelatedQuestionsTimestamp <
        CONSTANTS.RELATED_QUESTION_SEARCH_THRESHOLD
    ) {
        return;
    }
    lastSearchForRelatedQuestionsTimestamp = Date.now();

    const query = {};
    if (subject) {
        query.subject = subject;
    }
    if (
        question.length > CONSTANTS.RELATED_QUESTION_SEARCH_MIN_QUESTION_LENGTH
    ) {
        query.q = question;
    }

    if (Object.keys(query).length > 0) {
        Meteor.call('questions.related', query, function(error, result) {
            state.set('relatedQuestions', result);
        });
    } else {
        state.set('relatedQuestions', []);
    }
};

Template.relatedQuestions.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('subjects');

        const { subject, question } = Template.currentData();
        if (subject && question) {
            searchForRelatedQuestions(subject, question, this.state);
        }
    });
});

Template.relatedQuestions.helpers({
    relatedQuestions() {
        return Template.instance().state.get('relatedQuestions');
    }
});

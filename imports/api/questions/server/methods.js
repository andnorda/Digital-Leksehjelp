import { Meteor } from 'meteor/meteor';
import QuestionHelpers from '../questionHelpers.js';
import { CONSTANTS } from '/imports/constants.js';

Meteor.methods({
    'questions.searchCount'(params) {
        return QuestionHelpers.search({
            ...params,
            userId: Meteor.userId()
        }).count();
    },

    'questions.related'(params) {
        params.limit = CONSTANTS.RELATED_QUESTION_SEARCH_LIMIT;
        params.related = true;
        return QuestionHelpers.search(params, Meteor.userId()).fetch();
    }
});

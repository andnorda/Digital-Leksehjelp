import { Meteor } from 'meteor/meteor';
import QuestionHelpers from '../questionHelpers.js';

Meteor.methods({
    'questions.searchCount'(params) {
        return QuestionHelpers.search(params, Meteor.userId()).count();
    }
});

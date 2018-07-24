import { Meteor } from 'meteor/meteor';
import { Feedback } from '../feedback.js';

Meteor.publish('feedback', function() {
    return Feedback.find({});
});

Meteor.publish('feedback.byQuestionId', function(questionId) {
    return Feedback.find({ questionId });
});

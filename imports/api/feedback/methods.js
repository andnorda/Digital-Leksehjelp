import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Feedback } from './feedback.js';

const NonEmptyString = Match.Where(x => {
    check(x, String);
    return x.length > 0;
});

Meteor.methods({
    'feedback.send'({ feedback, questionId }) {
        check(feedback, NonEmptyString);
        check(questionId, NonEmptyString);

        Feedback.insert({
            feedback,
            questionId,
            createdAt: new Date()
        });
    },

    'feedback.delete'(id) {
        check(id, String);

        if (!Meteor.users.findOne(this.userId)) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Feedback.remove(id);
    }
});

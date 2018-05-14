import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Topics } from '../topics.js';

Meteor.publish('topics.bySubjectId', function(subjectId) {
    check(subjectId, String);

    return Topics.find({ subjectId });
});

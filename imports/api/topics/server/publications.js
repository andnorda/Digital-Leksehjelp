import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Topics } from '../topics.js';
import { Subjects } from '../../subjects/subjects.js';

Meteor.publish('topics.bySubjectId', function(subjectId) {
    check(subjectId, String);
    return Topics.find({ subjectId });
});

Meteor.publish('topics.bySubject', function(subject) {
    check(subject, String);

    return Topics.find({
        subjectId: Subjects.findOne({ name: subject })._id
    });
});

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

    const s = Subjects.findOne({ name: subject });
    if (s) {
        return Topics.find({
            subjectId: s._id
        });
    } else {
        return this.ready();
    }
});

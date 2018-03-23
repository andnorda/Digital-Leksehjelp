import { Subjects } from '../subjects.js';

Meteor.publish('subjects', function() {
    return Subjects.find({});
});

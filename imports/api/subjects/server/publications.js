import { Meteor } from 'meteor/meteor';
import { Subjects } from '../subjects.js';

Meteor.publish('subjects', function() {
    return Subjects.find({});
});

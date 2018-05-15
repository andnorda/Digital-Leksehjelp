import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';
import { Subjects } from '../imports/api/subjects/subjects.js';

Migrations.add({
    version: 1,
    up() {
        Meteor.users.find().forEach(user => {
            const subjects = (user.profile.subjects || [])
                .map(({ subjectId }) => Subjects.findOne(subjectId))
                .filter(s => s)
                .map(subject => subject.name);
            Meteor.users.update(user._id, { $set: { subjects } });
        });
    },
    down() {
        Meteor.users.find().forEach(user => {
            const subjects = (user.subjects || [])
                .map(name => Subjects.findOne({ name }))
                .filter(s => s)
                .map(subject => subject._id);
            Meteor.users.update(user._id, {
                $set: { subjects: subjects }
            });
        });
    }
});

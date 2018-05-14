import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ADMIN } from '/imports/userRoles.js';
import { Topics } from './topics.js';
import { Subjects } from '../subjects/subjects.js';

Meteor.methods({
    'topics.insert'({ subjectId, name }) {
        check(subjectId, String);
        check(name, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }
        if (!Subjects.findOne(subjectId)) {
            throw new Meteor.Error(404, 'Subject not found.');
        }

        Topics.insert({ subjectId, name }, function(error) {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            }
        });
    },

    'topics.remove'(id) {
        check(id, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Topics.remove({ _id: id }, function(error) {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            }
        });
    }
});

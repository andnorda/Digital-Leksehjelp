import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ADMIN } from '/imports/userRoles.js';
import { urlify } from '/imports/utils.js';
import { Subjects } from './subjects.js';
import { Topics } from '../topics/topics.js';

Meteor.methods({
    'subjects.removeSubjectFromProfile'(subjectId) {
        check(subjectId, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        const userId = this.userId;

        Meteor.users.update(
            { _id: userId },
            {
                $pull: {
                    'profile.subjects': { subjectId }
                }
            },
            function(err) {
                if (err) {
                    throw new Meteor.Error(500, err.message);
                }
            }
        );
    },

    'subjects.addSubjectToProfile'(subjectId) {
        check(subjectId, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        const userId = this.userId;

        Meteor.users.update(
            { _id: userId },
            {
                $push: {
                    'profile.subjects': { subjectId }
                }
            },
            function(err) {
                if (err) {
                    throw new Meteor.Error(500, err.message);
                }
            }
        );
    },

    'subjects.update'(options) {
        check(options.subjects, [{ subjectId: String, subjectName: String }]);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        const subjects = []
            .concat(user.profile.subjects)
            .concat(options.subjects)
            .filter(
                (value, index, array) =>
                    array.map(s => s.subjectName).indexOf(value.subjectName) ===
                    index
            );

        Meteor.users.update(
            { _id: this.userId },
            { $set: { 'profile.subjects': subjects } }
        );
    },

    'subjects.insert'(options) {
        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Subjects.insert({ name: options.subject }, function(error) {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            }
        });
    },

    'subjects.remove'(options) {
        check(options.subjectId, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Subjects.remove({ _id: options.subjectId }, function(error) {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            } else {
                Topics.remove({ subjectId: options.subjectId });
            }
        });
    }
});

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ADMIN } from '/imports/userRoles.js';
import { HelpTopics } from './helpTopics.js';

Meteor.methods({
    'helpTopics.insert'(helpTopic) {
        check(helpTopic, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        HelpTopics.insert({ name: helpTopic }, error => {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            }
        });
    },

    'helpTopics.remove'(subjectId) {
        check(subjectId, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        HelpTopics.remove({ _id: subjectId }, error => {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            }
        });
    }
});

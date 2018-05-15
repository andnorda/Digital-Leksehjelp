import { Meteor } from 'meteor/meteor';
import { ADMIN } from '/imports/userRoles.js';

Meteor.publish('users', function() {
    if (!this.userId) {
        return this.ready();
    }

    const user = Meteor.users.findOne(this.userId);
    if (user.profile.role === ADMIN) {
        return Meteor.users.find(
            {},
            { fields: { username: 1, emails: 1, profile: 1, subjects: 1 } }
        );
    }

    return Meteor.users.find(
        {},
        {
            fields: {
                username: true,
                'profile.pictureUrl': 1,
                'profile.firstName': 1,
                subjects: 1,
                // TODO(martin): The next field could be more restricted
                'profile.role': 1,
                'status.online': 1
            }
        }
    );
});

Meteor.publish('users.self', function() {
    if (!this.userId) {
        return this.ready();
    }

    return Meteor.users.find(this.userId);
});

Meteor.publish('users.loggedIn', function() {
    return Meteor.users.find(
        {
            $and: [
                { 'profile.allowVideohelp': true },
                { 'status.online': true }
            ]
        },
        {
            fields: {
                'profile.pictureUrl': 1,
                'profile.firstName': 1,
                subjects: 1,
                'profile.role': 1,
                'status.online': 1,
                'profile.allowVideohelp': 1
            }
        }
    );
});

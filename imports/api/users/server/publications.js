import { ROLES } from '/imports/constants';

Meteor.publish('all-users', function() {
    var user = Meteor.users.findOne(this.userId);
    if (user) {
        if (user.profile.role === ROLES.ADMIN) {
            return Meteor.users.find(
                {},
                { fields: { username: 1, emails: 1, profile: 1 } }
            );
        } else {
            return Meteor.users.find(
                {},
                {
                    fields: {
                        username: true,
                        'profile.pictureUrl': 1,
                        'profile.firstName': 1,
                        'profile.subjects': 1,
                        //TODO(martin): The next field could be more restricted
                        'profile.role': 1,
                        'status.online': 1
                    }
                }
            );
        }
    }

    this.ready();
});

Meteor.publish('loggedInUsers', function() {
    var user = Meteor.users.findOne(this.userId);
    var publicLoggedInCursor = Meteor.users.find(
        {
            $and: [
                { 'profile.allowVideohelp': { $exists: true } },
                { 'services.resume.loginTokens': { $exists: true } },
                { 'services.resume.loginTokens': { $not: { $size: 0 } } }
            ]
        },
        {
            fields: {
                'profile.pictureUrl': 1,
                'profile.firstName': 1,
                'profile.subjects': 1,
                'profile.role': 1,
                'status.online': 1,
                'profile.allowVideohelp': 1
            }
        }
    );

    if (!user) {
        return publicLoggedInCursor;
    }

    var userRole = user.profile.role;

    if (userRole === ROLES.ADMIN) {
        return Meteor.users.find({
            $and: [
                { 'services.resume.loginTokens': { $exists: true } },
                { 'services.resume.loginTokens': { $not: { $size: 0 } } }
            ]
        });
    } else {
        return publicLoggedInCursor;
    }
});

Meteor.publish('user-data', function() {
    return Meteor.users.findOne(this.userId);
});

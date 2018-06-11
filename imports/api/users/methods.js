import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { ADMIN } from '/imports/userRoles.js';

Meteor.methods({
    'users.addSubject'(subject) {
        check(subject, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Meteor.users.update(
            { _id: this.userId },
            { $addToSet: { subjects: subject } }
        );
    },

    'users.removeSubject'(subject) {
        check(subject, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Meteor.users.update(
            { _id: this.userId },
            { $pull: { subjects: subject } }
        );
    },

    'users.addHelpTopic'(helpTopic) {
        check(helpTopic, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Meteor.users.update(
            { _id: this.userId },
            { $addToSet: { helpTopics: helpTopic } }
        );
    },

    'users.removeHelpTopic'(helpTopic) {
        check(helpTopic, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Meteor.users.update(
            { _id: this.userId },
            { $pull: { helpTopics: helpTopic } }
        );
    },

    'users.updateName'(name) {
        check(name, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Meteor.users.update(
            { _id: this.userId },
            {
                $set: { 'profile.firstName': name }
            }
        );
    },

    'users.updateRole'(options) {
        check(options.userId, String);
        check(options.role, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (user.profile.role === ADMIN) {
            const currentRole = Meteor.users
                .find({ _id: options.userId })
                .fetch()[0].profile.role;
            if (currentRole === ADMIN && options.role !== ADMIN) {
                const nrOfAdminsLeft = Meteor.users
                    .find({ 'profile.role': ADMIN })
                    .fetch();
                if (nrOfAdminsLeft.length === 1) {
                    throw new Meteor.Error(
                        403,
                        'This user is the last administrator.'
                    );
                }
            }
            const updateDoc = {
                $set: { 'profile.role': options.role }
            };
            return Meteor.users.update({ _id: options.userId }, updateDoc);
        }
        throw new Meteor.Error(403, 'You are not allowed to access this.');
    },

    'users.remove'(userId) {
        check(userId, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (user.profile.role === ADMIN) {
            const currentRole = Meteor.users.find({ _id: userId }).fetch()[0]
                .profile.role;
            if (currentRole === ADMIN) {
                const nrOfAdminsLeft = Meteor.users
                    .find({ 'profile.role': ADMIN })
                    .fetch();
                if (nrOfAdminsLeft.length === 1) {
                    throw new Meteor.Error(
                        403,
                        'This user is the last administrator.'
                    );
                }
            }
            return Meteor.users.remove({ _id: userId });
        }
        throw new Meteor.Error(403, 'You are not allowed to access this.');
    },

    'users.toggleAllowVideohelp'({ userId }) {
        check(userId, String);

        const user = Meteor.users.findOne(Meteor.userId());
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        const otherUser = Meteor.users.findOne(userId);
        if (!otherUser) {
            throw new Meteor.Error(
                404,
                `User with id ${userId} does not exist.`
            );
        }

        Meteor.users.update(
            { _id: userId },
            {
                $set: {
                    'profile.allowVideohelp': !otherUser.profile.allowVideohelp
                }
            }
        );
    },

    'users.setProfilePictureUrl'(url) {
        check(url, String);
        if (!this.userId) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Meteor.users.update(
            { _id: this.userId },
            {
                $set: {
                    'profile.pictureUrl': url
                }
            }
        );
    },

    'users.create'(options) {
        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        check(options.username, String);
        check(options.email, String);
        check(options.profile.firstName, String);
        check(options.profile.role, String);
        check(options.profile.allowVideohelp, Boolean);

        options.profile.forceLogOut = false;
        options.subjects = [];

        if (user.profile.role === ADMIN) {
            const userId = Accounts.createUser(options);
            Accounts.sendEnrollmentEmail(userId);
            return userId;
        }
        throw new Meteor.Error(403, 'You are not allowed to access this.');
    },

    'users.logOut'(options) {
        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        check(options.userId, String);

        if (user.profile.role === ADMIN) {
            const remoteUser = Meteor.users.find(options.userId).fetch()[0];

            if (remoteUser.status.online) {
                Meteor.users.update(
                    { _id: options.userId },
                    {
                        $set: {
                            'profile.forceLogOut': true
                        }
                    }
                );
            } else {
                Meteor.users.update(
                    { _id: options.userId },
                    {
                        $set: {
                            'services.resume.loginTokens': []
                        }
                    }
                );
            }
        } else {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }
    }
});

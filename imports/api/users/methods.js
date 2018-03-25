import { ROLES } from '/imports/constants';

Meteor.methods({
    updateUserRole: function(options) {
        check(options.userId, String);
        check(options.role, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (user.profile.role === ROLES.ADMIN) {
            var currentRole = Meteor.users
                .find({ _id: options.userId })
                .fetch()[0].profile.role;
            if (currentRole === ROLES.ADMIN && options.role !== ROLES.ADMIN) {
                var nrOfAdminsLeft = Meteor.users
                    .find({ 'profile.role': ROLES.ADMIN })
                    .fetch();
                if (nrOfAdminsLeft.length === 1) {
                    throw new Meteor.Error(
                        403,
                        'This user is the last administrator.'
                    );
                }
            }
            var updateDoc = {
                $set: { 'profile.role': options.role }
            };
            return Meteor.users.update({ _id: options.userId }, updateDoc);
        } else {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }
    },

    removeUser: function(options) {
        check(options.userId, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (user.profile.role === ROLES.ADMIN) {
            var currentRole = Meteor.users
                .find({ _id: options.userId })
                .fetch()[0].profile.role;
            if (currentRole === ROLES.ADMIN) {
                var nrOfAdminsLeft = Meteor.users
                    .find({ 'profile.role': ROLES.ADMIN })
                    .fetch();
                if (nrOfAdminsLeft.length === 1) {
                    throw new Meteor.Error(
                        403,
                        'This user is the last administrator.'
                    );
                }
            }
            return Meteor.users.remove({ _id: options.userId });
        } else {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }
    },

    toggleAllowVideohelp: function(options) {
        check(options.userId, String);

        var user = Meteor.users.findOne({ _id: Meteor.userId() });
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (user.profile.role === ROLES.ADMIN) {
            var otherUser = Meteor.users.findOne({ _id: options.userId });
            if (!user) {
                throw new Meteor.Error(
                    404,
                    'User with id ' + options.userId + ' does not exist.'
                );
            }

            var currentAllowVideohelp = otherUser.profile.allowVideohelp;
            var newAllowVideohelp = !currentAllowVideohelp;

            Meteor.users.update(
                { _id: otherUser._id },
                {
                    $set: {
                        'profile.allowVideohelp': newAllowVideohelp
                    }
                }
            );

            if (newAllowVideohelp) {
                var subjectIds = otherUser.profile.subjects.map(function(
                    subject
                ) {
                    return subject.subjectId;
                });

                for (var i = 0; i < subjectIds.length; i++) {
                    Subjects.update(
                        { _id: subjectIds[i] },
                        { $addToSet: { availableVolunteers: otherUser._id } }
                    );
                }
            } else {
                Subjects.update(
                    {},
                    { $pull: { availableVolunteers: otherUser._id } },
                    { multi: true }
                );
            }
        } else {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }
    },
    setProfilePictureUrl: function(url) {
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

    createUserOnServer: function(options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        check(options.username, String);
        check(options.email, String);
        check(options.profile.firstName, String);
        check(options.profile.role, String);
        check(options.profile.allowVideohelp, Boolean);

        options.profile.setSubjectsAvailable = true;
        options.profile.forceLogOut = false;
        options.profile.subjects = [];

        if (user.profile.role === ROLES.ADMIN) {
            var userId = Accounts.createUser(options);
            Accounts.sendEnrollmentEmail(userId);
            return userId;
        } else {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }
    },

    remoteLogOutUser: function(options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        check(options.userId, String);

        if (user.profile.role === ROLES.ADMIN) {
            var remoteUser = Meteor.users.find(options.userId).fetch()[0];

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

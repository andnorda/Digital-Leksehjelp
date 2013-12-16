Meteor.methods({
    updateUser: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.userId, String);
        check(options.role, String);

        if (user.profile.role === ROLES.ADMIN) {
            var updateDoc = {
                $set: { 'profile.role': options.role}
            };
            return Meteor.users.update({_id: options.userId}, updateDoc);
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    removeUser: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.userId, String);

        if (user.profile.role === ROLES.ADMIN) {
            return Meteor.users.remove({_id: options.userId});
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    logoutUser: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.userId, String);

        if (user.profile.role === ROLES.ADMIN) {
            Meteor.users.update({_id: options.userId}, { $set: { 'services.resume.loginTokens' : [] }});
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    updateMySubjects: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.subjects, [String]);

        Meteor.users.update({_id: this.userId}, { $set: { 'profile.subjects' : options.subjects }});
    },

    insertNewSubject: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.subject, String);

        Subjects.insert(
            { name: options.subject },
            function (error, id) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
            });
    }
});

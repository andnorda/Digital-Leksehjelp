// Use DL for namespacing Digital Leksehjelp
Meteor.methods({
    createUserOnServer: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.username, String);
        check(options.email, String);
        check(options.profile.firstName, String);
        check(options.profile.role, String);

        options.profile.setSubjectsAvailable = true;
        options.profile.forceLogOut = false;
        options.profile.subjects = [];

        if (user.profile.role === ROLES.ADMIN) {
            var userId = Accounts.createUser(options);
            Accounts.sendEnrollmentEmail(userId);
            return userId;
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    }
});

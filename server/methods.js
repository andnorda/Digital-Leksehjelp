// Use DL for namespacing Digital Leksehjelp
Meteor.methods({
    DLcreateUser: function (options) {
        check(options.username, String);
        check(options.email, String);
        check(options.profile.firstName, String);
        check(options.profile.role, String);

        var userId = Accounts.createUser(options);
        Accounts.sendEnrollmentEmail(userId);

        return userId;
    }
});

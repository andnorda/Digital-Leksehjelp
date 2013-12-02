if (Meteor.isServer) {
    // These methods are available to the client with Meteor.call('methodName', 'each', 'argument').
    Meteor.methods({
        createTutor: function (options) {
            check(options.admin, Boolean);
            check(options.username, String);
            check(options.email, String);

            var userId = Accounts.createUser(options);
            Accounts.sendEnrollmentEmail(userId);
        }
    });
}

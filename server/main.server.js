// Server only logic, this will NOT be sent to the clients.

Meteor.startup(function () {
    //TODO(martin): This needs to be set to a username and password agreed with Red Cross
    if(Meteor.users.find().count() === 0) {
        console.log("WARNING: NO USERS, DEFAULT ADMIN ACCOUNT ADDED");
        var options = {
            username: 'admin',
            password: 'admin',
            profile: {
                role: ROLES.ADMIN
            },
            email: 'martin@iterate.no'
        };
        Accounts.createUser(options);
    };
});

Accounts.validateNewUser(function (user) {
    //TODO(martin): Should be able to create users on server, not on client.
    // throw new Meteor.Error(403, "You are not allowed to create new users");
    return true;
});

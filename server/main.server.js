// Server only logic, this will NOT be sent to the clients.

Meteor.startup(function () {
    if(Meteor.users.find().count() === 0) {
        console.log("WARNING: NO USERS, DEFAULT ADMIN ACCOUNT ADDED");
        var options = {
            username: 'orkis@redcross.no',
            password: 'orkisadmin',
            profile: {
                role: ROLES.ADMIN,
                setSubjectsAvailable: true,
                forceLogOut: false,
                subjects: [],
                firstName: 'Orkis'
            },
            email: 'orkis@redcross.no'
        };
        Accounts.createUser(options);
    };
});

Accounts.validateNewUser(function (user) {
    //TODO(martin): Should be able to create users on server, not on client.
    // throw new Meteor.Error(403, "You are not allowed to create new users");
    return true;
});

if(Meteor.isServer) {
    Accounts.validateNewUser(function (user) {
        throw new Meteor.Error(403, "You are not allowed to create new users");
    });
}

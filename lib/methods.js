Meteor.methods({
    updateUser: function (options) {
        check(options.userId, String);
        check(options.role, String);

        var updateDoc = {
            $set: { 'profile.role': options.role}
        };

        return Meteor.users.update({_id: options.userId}, updateDoc);
    },

    removeUser: function (options) {
        check(options.userId, String);

        return Meteor.users.remove({_id: options.userId});
    }
});

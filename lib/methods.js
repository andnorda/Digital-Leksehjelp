Meteor.methods({
    updateUser: function (options) {
        check(options.role, String);

        var updateDoc = {
            $set: { 'profile.role': options.role}
        };

        var nrOfAffectedDocs = Meteor.users.update({_id: options.userId}, updateDoc);

        return nrOfAffectedDocs;
    }
});

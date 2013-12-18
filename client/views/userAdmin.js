var userAddedDep = new Deps.Dependency;
var userAdded;

Template.addUser.userAdded = function () {
    userAddedDep.depend();
    return userAdded;
};

Template.addUser.events({
    'click .addUser': function(event) {
        event.preventDefault();
        var email = $('#email').val();
        var firstName = $('#firstName').val();
        var role = $('#role').val();
        Meteor.call(
            'createUserOnServer',
            {
                username: email,
                email: email,
                profile: {
                    firstName: firstName,
                    role: role
                }
            },
            function (error, result) {
                if (error) {
                    userAdded = "Feil, brukeren med epost: " + email +
                        ", ble IKKE lagt til. Vennligst prøv igjen.";
                    FlashMessages.sendError(error.message);
                } else {
                    userAdded = "Brukeren med epost: " + email +
                        " er nå lagt til, og har fått tilsendt en bekreftelses-epost.";
                    $('#email').val("");
                    $('#firstName').val("");
                    $('#adminCheck').attr('checked', false);
                }
                userAddedDep.changed();
            });
    }
});

// === ROLESELECTOR ===
Template.roleSelector.roles = function () {
    return ROLES;
};

// === USERSTABLE ===
Template.usersTable.users = function () {
    return Meteor.users.find({}).fetch();
};

// === USERROW ===
var newUserRole;

Template.userRow.remoteUserLoggedIn = function () {
    var userLoggedInArray = Meteor.users.find({
            $and: [
                { '_id': this._id },
                { 'services.resume.loginTokens': { $exists:true } },
                { 'services.resume.loginTokens': { $not: { $size: 0 } }}
            ]}).fetch();
    return (userLoggedInArray.length > 0) ? true : false;
};

Template.userRow.events({
    'change .newRole' : function (event) {
        newUserRole = event.target.value;
        Meteor.call('updateUser',
            {
                userId: this._id,
                role: newUserRole
            },
            function (error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                };
            });
    },

    'click .deleteUser' : function (event) {
        Meteor.call('removeUser',
            {
                userId: this._id
            },
            function (error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                };
            });
    },

    'click .logoutUser' : function (event) {
        Meteor.call('logoutUser',
        {
            userId: this._id
        },
        function (error, result) {
            if (error) {
                FlashMessages.sendError(error.message);
            }
        });
    }
});

var userAddedDep = new Deps.Dependency();
var userAdded;

Template.addUser.helpers({
    userAdded: function() {
        userAddedDep.depend();
        return userAdded;
    }
});

Template.addUser.events({
    'click .addUser': function(event) {
        event.preventDefault();
        var email = $('#email').val();
        var firstName = $('#firstName').val();
        var role = $('#role').val();
        var allowVideohelp = $('#allowVideohelp:checked').val() ? true : false;

        Meteor.call(
            'createUserOnServer',
            {
                username: email,
                email: email,
                profile: {
                    firstName: firstName,
                    role: role,
                    allowVideohelp: allowVideohelp
                }
            },
            function(error, result) {
                if (error) {
                    userAdded =
                        'Feil, brukeren med epost: ' +
                        email +
                        ', ble IKKE lagt til. Vennligst prøv igjen.';
                    FlashMessages.sendError(error.message);
                } else {
                    userAdded =
                        'Brukeren med epost: ' +
                        email +
                        ' er nå lagt til, og har fått tilsendt en bekreftelses-epost.';
                    $('#email').val('');
                    $('#firstName').val('');
                    $('#adminCheck').attr('checked', false);
                }
                userAddedDep.changed();
            }
        );
    }
});

// === ROLESELECTOR ===
Template.roleSelector.helpers({
    roles: function() {
        var rolesArray = [];
        for (var key in ROLES) {
            if (ROLES.hasOwnProperty(key)) {
                var val = ROLES[key];
                rolesArray.push(val);
            }
        }
        return rolesArray;
    }
});

// === USERSTABLE ===
Template.usersTable.helpers({
    users: function() {
        return Meteor.users.find({}).fetch();
    }
});

// === USERROW ===
var newUserRole;

Template.userRow.helpers({
    remoteUserLoggedIn: function() {
        var userLoggedInArray = Meteor.users
            .find({
                $and: [
                    { _id: this._id },
                    { 'services.resume.loginTokens': { $exists: true } },
                    { 'services.resume.loginTokens': { $not: { $size: 0 } } }
                ]
            })
            .fetch();
        return userLoggedInArray.length > 0 ? true : false;
    }
});

Template.userRow.events({
    'change .newRole': function(event) {
        newUserRole = event.target.value;
        Meteor.call(
            'updateUserRole',
            {
                userId: this._id,
                role: newUserRole
            },
            function(error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    },

    'click .deleteUser': function(event) {
        Meteor.call(
            'removeUser',
            {
                userId: this._id
            },
            function(error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    },

    'click .logoutUser': function(event) {
        Meteor.call(
            'remoteLogOutUser',
            {
                userId: this._id
            },
            function(error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    },

    'click .allowVideohelp': function(event) {
        Meteor.call(
            'toggleAllowVideohelp',
            {
                userId: this._id
            },
            function(error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    }
});

// === OPENINGHOURS ===
Template.openingHours.helpers({
    openingHours: function() {
        var openingHoursArray = Config.find({ name: 'openingHours' }).fetch();

        if (openingHoursArray.length > 0) {
            return openingHoursArray[0].text;
        }
        return '';
    }
});

Template.openingHours.events({
    'click button#updateOpeningHours': function() {
        Meteor.call(
            'upsertOpeningHours',
            {
                newOpeningHours: $('#openingHours')
                    .val()
                    .trim()
            },
            function(error, data) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    }
});

// === SERVICESTATUS ===
Template.serviceClosedAdmin.events({
    'click button#updateClosedStatus': function() {
        Meteor.call(
            'upsertServiceStatus',
            {
                newServiceStatus: false
            },
            function(error, data) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    }
});

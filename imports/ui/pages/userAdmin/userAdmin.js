import { Config } from '/imports/api/config/config.js';

import { ROLES } from '/imports/constants';

import './userAdmin.html';

import '../../components/serviceStatus/serviceStatus.js';

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
            'users.create',
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
Template.usersTable.onCreated(function usersTableOnCreated() {
    this.autorun(() => {
        this.subscribe('users');
    });
});

Template.usersTable.helpers({
    users: function() {
        return Meteor.users.find({}).fetch();
    }
});

// === USERROW ===
Template.userRow.onCreated(function userRowOnCreated() {
    this.autorun(() => {
        this.subscribe('users');
    });
});

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
            'users.updateRole',
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
            'users.remove',
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
            'users.logOut',
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
            'users.toggleAllowVideohelp',
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

Template.openingHours.onCreated(function openingHoursOnCreated() {
    this.autorun(() => {
        this.subscribe('config.openingHours');
    });
});

Template.openingHours.helpers({
    openingHours: function() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        return openingHours ? openingHours.text : '';
    }
});

Template.openingHours.events({
    'click button#updateOpeningHours': function() {
        const openingHours = $('#openingHours')
            .val()
            .trim();
        Meteor.call('config.setOpeningHours', openingHours, function(
            error,
            data
        ) {
            if (error) {
                FlashMessages.sendError(error.message);
            } else {
                FlashMessages.sendSuccess('Åpningstider endret', {
                    autoHide: true,
                    hideDelay: 6000
                });
            }
        });
    }
});

Template.serviceClosedAdmin.onCreated(function serviceClosedAdminOnCreated() {
    this.autorun(() => {
        this.subscribe('config.serviceStatus');
    });
});

Template.serviceClosedAdmin.helpers({
    serviceIsOpen: function() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus ? serviceStatus.open : false;
    }
});

Template.serviceClosedAdmin.events({
    'click button#updateClosedStatus': function() {
        Meteor.call('config.closeService', function(error, data) {
            if (error) {
                FlashMessages.sendError(error.message);
            }
        });
    }
});

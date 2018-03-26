import { Meteor } from 'meteor/meteor';
import { Deps } from 'meteor/deps';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import { Config } from '/imports/api/config/config.js';

import { ROLES } from '/imports/constants';

import './userAdmin.html';

import '../../components/serviceStatus/serviceStatus.js';

const userAddedDep = new Deps.Dependency();
let userAdded;

Template.addUser.helpers({
    userAdded() {
        userAddedDep.depend();
        return userAdded;
    }
});

Template.addUser.events({
    'click .addUser'(event) {
        event.preventDefault();
        const email = $('#email').val();
        const firstName = $('#firstName').val();
        const role = $('#role').val();
        const allowVideohelp = !!$('#allowVideohelp:checked').val();

        Meteor.call(
            'users.create',
            {
                username: email,
                email,
                profile: {
                    firstName,
                    role,
                    allowVideohelp
                }
            },
            function(error) {
                if (error) {
                    userAdded = `Feil, brukeren med epost: ${email}, ble IKKE lagt til. Vennligst prøv igjen.`;
                    FlashMessages.sendError(error.message);
                } else {
                    userAdded = `Brukeren med epost: ${email} er nå lagt til, og har fått tilsendt en bekreftelses-epost.`;
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
    roles() {
        return Object.keys(ROLES).map(id => ROLES[id]);
    }
});

// === USERSTABLE ===
Template.usersTable.onCreated(function usersTableOnCreated() {
    this.autorun(() => {
        this.subscribe('users');
    });
});

Template.usersTable.helpers({
    users() {
        return Meteor.users.find({}).fetch();
    }
});

// === USERROW ===
Template.userRow.onCreated(function userRowOnCreated() {
    this.autorun(() => {
        this.subscribe('users');
    });
});

let newUserRole;

Template.userRow.helpers({
    remoteUserLoggedIn() {
        const userLoggedInArray = Meteor.users
            .find({
                $and: [
                    { _id: this._id },
                    { 'services.resume.loginTokens': { $exists: true } },
                    { 'services.resume.loginTokens': { $not: { $size: 0 } } }
                ]
            })
            .fetch();
        return userLoggedInArray.length > 0;
    }
});

Template.userRow.events({
    'change .newRole'(event) {
        newUserRole = event.target.value;
        Meteor.call(
            'users.updateRole',
            {
                userId: this._id,
                role: newUserRole
            },
            function(error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    },

    'click .deleteUser'() {
        Meteor.call(
            'users.remove',
            {
                userId: this._id
            },
            function(error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    },

    'click .logoutUser'() {
        Meteor.call(
            'users.logOut',
            {
                userId: this._id
            },
            function(error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    },

    'click .allowVideohelp'() {
        Meteor.call(
            'users.toggleAllowVideohelp',
            {
                userId: this._id
            },
            function(error) {
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
    openingHours() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        return openingHours ? openingHours.text : '';
    }
});

Template.openingHours.events({
    'click button#updateOpeningHours'() {
        const openingHours = $('#openingHours')
            .val()
            .trim();
        Meteor.call('config.setOpeningHours', openingHours, function(error) {
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
    serviceIsOpen() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus ? serviceStatus.open : false;
    }
});

Template.serviceClosedAdmin.events({
    'click button#updateClosedStatus'() {
        Meteor.call('config.closeService', function(error) {
            if (error) {
                FlashMessages.sendError(error.message);
            }
        });
    }
});

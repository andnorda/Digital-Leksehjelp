import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Config } from './config.js';
import { ROLES } from '/imports/constants';

Meteor.methods({
    'config.setOpeningHours'(openingHours) {
        check(openingHours, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ROLES.ADMIN) {
            throw new Meteor.Error(401, 'Unauthorized');
        }

        Config.upsert(
            { name: 'openingHours' },
            { $set: { text: openingHours } }
        );
    },

    'config.setServiceStatus'(options) {
        check(options.newServiceStatus, Boolean);

        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        var updateDoc;
        if (user.profile.role === ROLES.ADMIN) {
            updateDoc = { $set: { open: options.newServiceStatus } };
        } else if (
            user.profile.role === ROLES.TUTOR &&
            user.profile.allowVideohelp &&
            options.newServiceStatus === true
        ) {
            updateDoc = { $set: { open: options.newServiceStatus } };
        } else {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Config.upsert({ name: 'serviceStatus' }, updateDoc);
    },

    getEnvironment: function() {
        if (process.env.ROOT_URL === 'http://digitalleksehjelp.no') {
            return 'production';
        } else return 'development';
    }
});
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
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Config.upsert(
            { name: 'openingHours' },
            { $set: { text: openingHours } }
        );
    },

    'config.openService'() {
        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Config.upsert({ name: 'serviceStatus' }, { $set: { open: true } });
    },

    'config.closeService'() {
        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (user.profile.role !== ROLES.ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Config.upsert({ name: 'serviceStatus' }, { $set: { open: false } });
    },

    getEnvironment: function() {
        if (process.env.ROOT_URL === 'http://digitalleksehjelp.no') {
            return 'production';
        } else return 'development';
    }
});

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ADMIN } from '/imports/userRoles.js';
import { Config } from './config.js';

Meteor.methods({
    'config.setInfoMessage'(infoMessage) {
        check(infoMessage, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Config.upsert({ name: 'infoMessage' }, { $set: { text: infoMessage } });
    },

    'config.setOpeningHours'({
        text,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday
    }) {
        check(text, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Config.upsert(
            { name: 'openingHours' },
            {
                $set: {
                    text,
                    monday,
                    tuesday,
                    wednesday,
                    thursday,
                    friday,
                    saturday,
                    sunday
                }
            }
        );
    },

    'config.openService'() {
        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Config.upsert({ name: 'serviceStatus' }, { $set: { open: true } });
    },

    'config.closeService'() {
        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (user.profile.role !== ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Config.upsert({ name: 'serviceStatus' }, { $set: { open: false } });
    },

    getEnvironment() {
        if (process.env.ROOT_URL === 'http://digitalleksehjelp.no') {
            return 'production';
        }
        return 'development';
    }
});

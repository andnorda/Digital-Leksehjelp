import { Meteor } from 'meteor/meteor';
import { ROLES } from '/imports/constants';
import { Config } from '../config.js';

Meteor.publish('config.infoMessage', function() {
    return Config.find({ name: 'infoMessage' });
});

Meteor.publish('config.openingHours', function() {
    return Config.find({ name: 'openingHours' });
});

Meteor.publish('config.serviceStatus', function() {
    return Config.find({ name: 'serviceStatus' });
});

Meteor.publish('config', function() {
    if (!this.userId) {
        return this.ready();
    }
    const user = Meteor.users.findOne(this.userId);
    if (user.profile.role !== ROLES.ADMIN) {
        return this.ready();
    }

    return Config.find({});
});

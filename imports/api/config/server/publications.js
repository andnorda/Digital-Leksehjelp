import { Config } from '../config.js';

import { ROLES } from '/imports/constants';

Meteor.publish('openingHours', function() {
    return Config.find({ name: 'openingHours' });
});

Meteor.publish('serviceStatus', function() {
    return Config.find({ name: 'serviceStatus' });
});

Meteor.publish('config', function() {
    var user = Meteor.users.findOne(this.userId);

    if (user && user.profile.role === ROLES.ADMIN) {
        return Config.find({});
    }

    this.ready();
});

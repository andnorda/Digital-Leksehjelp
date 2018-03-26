import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';

import './serviceStatus.html';

Template.serviceStatus.onCreated(function serviceStatusOnCreated() {
    this.autorun(() => {
        this.subscribe('config.serviceStatus');
    });
});

Template.serviceStatus.helpers({
    serviceStatus() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus && serviceStatus.open;
    }
});

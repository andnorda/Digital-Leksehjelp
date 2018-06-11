import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';

import '../serviceStatus/serviceStatus.js';

import './openService.html';

Template.openService.onCreated(function openServiceOnCreated() {
    this.autorun(() => {
        this.subscribe('config.serviceStatus');
    });
});

Template.openService.helpers({
    serviceIsOpen() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus ? serviceStatus.open : false;
    }
});

Template.openService.events({
    'click button#openService'() {
        Meteor.call('config.openService');
    }
});

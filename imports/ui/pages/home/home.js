import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';

import './hero/hero.js';
import './homework/homework.js';
import './help/help.js';
import './questionsAndAnswers/questionsAndAnswers.js';
import './volunteers/volunteers.js';

import './home.html';
import './home.less';

Template.home.onCreated(function() {
    this.autorun(() => {
        this.subscribe('config.serviceStatus');
    });
});

Template.home.helpers({
    serviceStatus() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus && serviceStatus.open;
    }
});

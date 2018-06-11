import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';

import './home.html';
import './home.less';

import '../../components/formMessage/formMessage.js';

Template.hero.onCreated(function() {
    this.autorun(() => {
        this.subscribe('config.infoMessage');
    });
});

Template.hero.helpers({
    infoMessage() {
        const infoMessage = Config.findOne({ name: 'infoMessage' });
        return infoMessage && infoMessage.text;
    }
});

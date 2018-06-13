import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';
import '../../../components/formMessage/formMessage.js';

import './hero.html';
import './hero.less';

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

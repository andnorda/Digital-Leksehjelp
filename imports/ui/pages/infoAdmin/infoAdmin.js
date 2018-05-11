import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import { Config } from '/imports/api/config/config.js';
import '../../components/button/button.js';

import './infoAdmin.html';
import './infoAdmin.less';

Template.infoAdmin.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('config.infoMessage');
        this.subscribe('config.openingHours');
    });
});

Template.infoAdmin.helpers({
    infoMessage() {
        const infoMessage = Config.findOne({ name: 'infoMessage' });
        return infoMessage ? infoMessage.text : '';
    },
    openingHours() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        return openingHours ? openingHours.text : '';
    },
    noInfoMessageChanges() {
        const infoMessage = Config.findOne({ name: 'infoMessage' });
        const temp = Template.instance().state.get('infoMessage');
        if (!infoMessage) {
            return true;
        }

        if (temp === undefined) {
            return true;
        }

        return temp === infoMessage.text;
    },
    noOpeningHoursChanges() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        const temp = Template.instance().state.get('openingHours');
        if (!openingHours) {
            return true;
        }

        if (temp === undefined) {
            return true;
        }

        return temp === openingHours.text;
    }
});

Template.infoAdmin.events({
    'input textarea.info-message'(event) {
        Template.instance().state.set('infoMessage', event.target.value);
    },

    'submit .info-message-form'(event, templateInstance) {
        event.preventDefault();

        Meteor.call(
            'config.setInfoMessage',
            Template.instance().state.get('infoMessage')
        );
    },

    'input textarea.opening-hours'(event) {
        Template.instance().state.set('openingHours', event.target.value);
    },

    'submit .opening-hours-form'(event, templateInstance) {
        event.preventDefault();

        Meteor.call(
            'config.setOpeningHours',
            Template.instance().state.get('openingHours')
        );
    }
});

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

const getDay = (openingHours, state, day) =>
    state.get(day) !== undefined
        ? state.get(day)
        : (openingHours && openingHours[day] && openingHours[day].open) ||
          false;

const getDayFrom = (openingHours, state, day) =>
    state.get(`${day}-from`) !== undefined
        ? state.get(`${day}-from`)
        : openingHours && openingHours[day] && openingHours[day].from;

const getDayTo = (openingHours, state, day) =>
    state.get(`${day}-to`) !== undefined
        ? state.get(`${day}-to`)
        : openingHours && openingHours[day] && openingHours[day].to;

const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

Template.infoAdmin.helpers({
    infoMessage() {
        const infoMessage = Config.findOne({ name: 'infoMessage' });
        return infoMessage ? infoMessage.text : '';
    },
    openingHoursText() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        return openingHours ? openingHours.text : '';
    },
    days() {
        return days;
    },
    dayLabel(day) {
        return {
            monday: 'mandag',
            tuesday: 'tirsdag',
            wednesday: 'onsdag',
            thursday: 'torsdag',
            friday: 'fredag',
            saturday: 'lørdag',
            sunday: 'søndag'
        }[day];
    },
    getDay(day) {
        return getDay(
            Config.findOne({ name: 'openingHours' }),
            Template.instance().state,
            day
        );
    },
    getDayFrom(day) {
        return getDayFrom(
            Config.findOne({ name: 'openingHours' }),
            Template.instance().state,
            day
        );
    },
    getDayTo(day) {
        return getDayTo(
            Config.findOne({ name: 'openingHours' }),
            Template.instance().state,
            day
        );
    },
    noInfoMessageChanges() {
        const infoMessage = Config.findOne({ name: 'infoMessage' });
        const temp = Template.instance().state.get('infoMessage');

        return temp === undefined || (infoMessage && temp === infoMessage.text);
    },
    noOpeningHoursChanges() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        const state = Template.instance().state;
        const temp = state.get('openingHoursText');

        if (!openingHours) {
            return true;
        }

        return (
            !days.some(day => dayChanged(openingHours, state, day)) &&
            (temp === undefined || temp === openingHours.text)
        );
    }
});

const dayChanged = (openingHours, state, day) =>
    getDay(openingHours, state, day) !==
        (openingHours[day] ? openingHours[day].open : false) ||
    getDayFrom(openingHours, state, day) !== (openingHours[day] || {}).from ||
    getDayTo(openingHours, state, day) !== (openingHours[day] || {}).to;

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

    'input input[type=checkbox][name=openingHours]'(event) {
        Template.instance().state.set(event.target.value, event.target.checked);
    },

    'input input[type=time]'(event) {
        Template.instance().state.set(event.target.id, event.target.value);
    },

    'input textarea.opening-hours-text'(event) {
        Template.instance().state.set('openingHoursText', event.target.value);
    },

    'submit .opening-hours-form'(event, templateInstance) {
        event.preventDefault();

        const openingHours = Config.findOne({ name: 'openingHours' });
        const state = Template.instance().state;

        const getText = (openingHours, state) =>
            state.get('openingHoursText') !== undefined
                ? state.get('openingHoursText')
                : (openingHours && openingHours.text) || '';

        Meteor.call('config.setOpeningHours', {
            text: getText(openingHours, state),
            ...days.reduce(
                (data, day) => ({
                    ...data,
                    [day]: {
                        open: getDay(openingHours, state, day),
                        from: getDayFrom(openingHours, state, day),
                        to: getDayTo(openingHours, state, day)
                    }
                }),
                {}
            )
        });
    }
});

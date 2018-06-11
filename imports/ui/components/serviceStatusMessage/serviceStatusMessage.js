import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { getDay, isBefore, setHours, setMinutes } from 'date-fns';
import { Config } from '/imports/api/config/config.js';

import './serviceStatusMessage.html';
import './serviceStatusMessage.less';

Template.serviceStatusMessage.onCreated(function() {
    this.autorun(() => {
        this.subscribe('config.serviceStatus');
        this.subscribe('config.openingHours');
    });
});

const dayNames = {
    sunday: 'søndag',
    monday: 'mandag',
    tuesday: 'tirsdag',
    wednesday: 'onsdag',
    thursday: 'torsdag',
    friday: 'fredag',
    saturday: 'søndag'
};

const days = Object.keys(dayNames);

const today = days[getDay(new Date())];

const nextOpenDay = openingHours => {
    const day = getDay(new Date());
    for (let i = day; i <= day + 7; i += 1) {
        if (
            openingHours[days[i % 7]] &&
            openingHours[days[i % 7]].open &&
            (i % 7 !== day ||
                isBefore(
                    new Date(),
                    setHours(
                        setMinutes(
                            new Date(),
                            openingHours[days[i % 7]].from.split(':')[1]
                        ),
                        openingHours[days[i % 7]].from.split(':')[0]
                    )
                ))
        )
            return days[i % 7];
    }
};

const nextOpenTime = openingHours =>
    openingHours[nextOpenDay(openingHours)].from;

Template.serviceStatusMessage.helpers({
    isPending() {
        return !Config.findOne({ name: 'serviceStatus' });
    },
    serviceStatus() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus && serviceStatus.open;
    },
    closingTime() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        return openingHours && openingHours[today].to;
    },
    openingTime() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        if (!openingHours) return false;
        if (!nextOpenDay(openingHours)) return false;
        if (nextOpenDay(openingHours) === today)
            return `åpner kl. ${nextOpenTime(openingHours)}`;
        return `åpner ${dayNames[nextOpenDay(openingHours)]} kl. ${nextOpenTime(
            openingHours
        )}`;
    },
    fallbackText() {
        const openingHours = Config.findOne({ name: 'openingHours' });
        return openingHours && openingHours.text;
    }
});

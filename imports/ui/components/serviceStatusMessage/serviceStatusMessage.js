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
    saturday: 'lørdag'
};

const days = Object.keys(dayNames);

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
    (openingHours[nextOpenDay(openingHours)] || {}).from;

Template.serviceStatusMessage.helpers({
    serviceStatusMessage() {
        if (!Config.findOne({ name: 'serviceStatus' })) {
            return;
        }

        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        const openingHours = Config.findOne({ name: 'openingHours' });
        if (!serviceStatus || !openingHours) {
            return;
        }

        const today = days[getDay(new Date())];
        const closingTime = () => openingHours[today].to;
        const openingTime = () => nextOpenTime(openingHours);
        const isToday = () => nextOpenDay(openingHours) === today;
        const openingDay = () => dayNames[nextOpenDay(openingHours)];

        if (serviceStatus.open) {
            if (closingTime()) {
                return `åpen frem til kl. ${closingTime()}`;
            } else {
                return 'åpen nå';
            }
        } else {
            if (openingTime()) {
                if (isToday()) {
                    return `åpner kl. ${openingTime()}`;
                } else {
                    return `åpner ${openingDay()} kl. ${openingTime()}`;
                }
            } else {
                return openingHours.text;
            }
        }
    }
});

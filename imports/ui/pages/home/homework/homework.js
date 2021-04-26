import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';
import { Shifts } from '/imports/api/shifts/shifts.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import mixpanel from '/imports/mixpanel';
import { addWeeks, startOfDay, min, max, isAfter, format } from 'date-fns';
import { nickname } from '/imports/utils.js';
import '../../../components/serviceStatusMessage/serviceStatusMessage.js';
import '../../../components/subjectSelector/subjectSelector.js';
import '../../../components/button/button.js';
import '../../../components/formMessage/formMessage.js';

import './homework.html';
import './homework.less';

Template.homework.onCreated(function () {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('config.openingHours');
        this.subscribe('config.serviceStatus');

        const subject = Template.instance().state.get('subject');
        subject && this.subscribe('shifts.bySubjectName', subject);
    });
});

const joinQueue = (subject, type) => {
    if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    mixpanel.track('Bedt om leksehjelp', { fag: subject, type });
    Meteor.call(
        'studentSessions.create',
        {
            subject,
            type,
            nickname
        },
        function (error, sessionId) {
            Session.set('studentSessionId', sessionId);
            Session.set('queueStartTime', new Date().getTime());
            Router.go(`/queue/${sessionId}`);
        }
    );
};

const hasOpeningHours = () => {
    const openingHours = Config.findOne({ name: 'openingHours' });
    return (
        openingHours &&
        [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
        ].some(day => (openingHours[day] || {}).open)
    );
};

Template.homework.helpers({
    infoMessage() {
        return (
            Template.instance().state.get('subject') &&
            'For å være sikrere på at det ikke skal skje tekniske feil, bruk nettleserne Google Chrome, Firefox eller Opera.'
        );
    },
    serviceStatus() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus && serviceStatus.open;
    },
    hasOpeningHours() {
        return hasOpeningHours();
    },
    subject() {
        return Template.instance().state.get('subject');
    },
    noSubjectSelected() {
        return !Template.instance().state.get('subject');
    },
    shifts() {
        const hackedDate = () =>
            new Date(format(new Date(), 'YYYY-MM-DD HH:mm:ss+0000'));

        const subjectName = Template.instance().state.get('subject');

        const shifts = Shifts.find(
            {
                start: { $gt: hackedDate() },
                end: { $lt: addWeeks(hackedDate(), 2) },
                subjects: {
                    $elemMatch: {
                        $eq: subjectName
                    }
                }
            },
            { sort: { start: 1 } }
        ).fetch();
        if (shifts.length) {
            return Object.entries(
                shifts.reduce((dates, shift) => {
                    const day = startOfDay(shift.start);
                    if (dates[day]) {
                        return {
                            ...dates,
                            [day]: [...dates[day], shift]
                        };
                    }
                    return { ...dates, [day]: [shift] };
                }, {})
            )
                .map(([date, shifts]) => ({
                    start: min(...shifts.map(shift => shift.start)),
                    end: max(...shifts.map(shift => shift.end))
                }))
                .sort((a, b) => isAfter(a.start, b.start));
        }
    },
    onSubjectChange() {
        const state = Template.instance().state;
        return (subject, isAvailable) => {
            state.set('subject', subject);
            state.set('subjectIsAvailable', isAvailable);
        };
    },
    onClickChat() {
        const { state } = Template.instance();
        return () => {
            mixpanel.track('Valgt leksehjelp på forsiden', {
                fag: state.get('subject'),
                type: 'chat'
            });
            Router.go(`/moreInfo/${state.get('subject')}`);
        };
    },
    onClickVideo() {
        const state = Template.instance().state;
        return () => {
            if (state.get('subject') && !state.get('pending')) {
                joinQueue(state.get('subject'), 'video');
                state.set('pending', true);
            }
        };
    },
    subjectUnavailableMessage() {
        const state = Template.instance().state;
        return (
            state.get('subject') &&
            hasOpeningHours() &&
            !state.get('subjectIsAvailable')
        );
    }
});

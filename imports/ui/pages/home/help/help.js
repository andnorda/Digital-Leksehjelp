import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import mixpanel from '/imports/mixpanel';
import '../../../components/serviceStatusMessage/serviceStatusMessage.js';
import '../../../components/helpTopicSelector/helpTopicSelector.js';
import '../../../components/button/button.js';
import '../../../components/formMessage/formMessage.js';

import './help.html';
import './help.less';

Template.help.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('config.openingHours');
        this.subscribe('config.serviceStatus');
    });
});

const joinQueue = (subject, type) => {
    if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    mixpanel.track('Bedt om leksehjelp', { fag: subject, type: 'chat' });
    Meteor.call(
        'studentSessions.create',
        {
            subject,
            type
        },
        function(error, sessionId) {
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
        ].some(day => openingHours[day].open)
    );
};

Template.help.helpers({
    infoMessage() {
        return (
            Template.instance().state.get('helpTopic') &&
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
    helpTopic() {
        return Template.instance().state.get('helpTopic');
    },
    onHelpTopicChange() {
        const state = Template.instance().state;
        return (helpTopic, isAvailable) => {
            state.set('helpTopic', helpTopic);
            state.set('topicIsAvailable', isAvailable);
        };
    },
    onClickChat() {
        const state = Template.instance().state;
        return () => {
            if (state.get('helpTopic')) {
                joinQueue(state.get('helpTopic'), 'chat');
            }
        };
    },
    onClickVideo() {
        const state = Template.instance().state;
        return () => {
            if (state.get('helpTopic')) {
                joinQueue(state.get('helpTopic'), 'video');
            }
        };
    },
    topicUnavailableMessage() {
        const state = Template.instance().state;
        return (
            state.get('helpTopic') &&
            hasOpeningHours() &&
            !state.get('topicIsAvailable')
        );
    }
});

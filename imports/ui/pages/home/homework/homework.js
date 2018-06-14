import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import mixpanel from '/imports/mixpanel';
import '../../../components/serviceStatusMessage/serviceStatusMessage.js';
import '../../../components/newSubjectSelector/subjectSelector.js';
import '../../../components/button/button.js';
import '../../../components/formMessage/formMessage.js';

import './homework.html';
import './homework.less';

Template.homework.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
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
    subject() {
        return Template.instance().state.get('subject');
    },
    onSubjectChange() {
        const state = Template.instance().state;
        return subject => state.set('subject', subject);
    },
    onClickChat() {
        const state = Template.instance().state;
        return () => {
            if (state.get('subject')) {
                joinQueue(state.get('subject'), 'chat');
            }
        };
    },
    onClickVideo() {
        const state = Template.instance().state;
        return () => {
            if (state.get('subject')) {
                joinQueue(state.get('subject'), 'video');
            }
        };
    }
});

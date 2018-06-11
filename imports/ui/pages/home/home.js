import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Config } from '/imports/api/config/config.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import mixpanel from '/imports/mixpanel';

import './home.html';
import './home.less';

import '../../components/formMessage/formMessage.js';
import '../../components/newSubjectSelector/subjectSelector.js';
import '../../components/button/button.js';

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

Template.homework.onCreated(function() {
    this.state = new ReactiveDict();
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
            type: 'chat'
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
            'For å være sikrere på at det ikke skal skje tekniske feil, bruk nettlesere som Google Chrome, Firefox eller Opera.'
        );
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
        return () => joinQueue(state.get('subject'), 'chat');
    },
    onClickVideo() {
        const state = Template.instance().state;
        return () => joinQueue(state.get('subject'), 'video');
    }
});

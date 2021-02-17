import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';
import mixpanel from '/imports/mixpanel';
import { nickname } from '/imports/utils.js';

import './moreInfo.html';
import './moreInfo.less';

Template.moreInfo.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.moreInfo.helpers({
    grade() {
        return Template.instance().state.get('grade');
    },
    setGrade() {
        const { state } = Template.instance();
        return grade => state.set('grade', grade);
    },
    text() {
        return Template.instance().state.get('text');
    },
    submitButtonDisabled() {
        const { state } = Template.instance();
        return !state.get('text') || !state.get('grade');
    }
});


const joinQueue = (subject, grade, text) => {
    if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    mixpanel.track('Bedt om leksehjelp', {
        fag: subject,
        type: 'chat',
        grade,
        text
    });

    Meteor.call(
        'studentSessions.create',
        {
            subject,
            type: 'chat',
            nickname,
            grade,
            text
        },
        function(error, sessionId) {
            Session.set('studentSessionId', sessionId);
            Session.set('queueStartTime', new Date().getTime());
            Router.go(`/queue/${sessionId}`);
        }
    );
};

Template.moreInfo.events({
    'input textarea[name=question]'(event) {
        Template.instance().state.set('text', event.target.value);
    },
    'submit .moreInfoForm'(event) {
        event.preventDefault();

        const { state } = Template.instance();

        if (!state.get('pending')) {
            const { params: { subject } } = Router.current();
            const grade = state.get('grade');
            const text = state.get('text');
            joinQueue(subject, grade, text);
            state.set('pending', true);
        }
    }
});

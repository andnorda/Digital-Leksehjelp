import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Config } from '/imports/api/config/config.js';
import { generateNickname } from '/imports/swedish/utils.js';

import '../../../components/serviceStatusMessage/serviceStatusMessage.js';
import '../../../components/subjectSelector/subjectSelector.js';
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
    Meteor.call(
        'studentSessions.create',
        {
            subject,
            type,
            nickname: generateNickname()
        },
        function(error, sessionId) {
            Session.set('studentSessionId', sessionId);
            Session.set('queueStartTime', new Date().getTime());
            Router.go(`/queue/${sessionId}`);
        }
    );
};

Template.homework.helpers({
    serviceStatus() {
        const serviceStatus = Config.findOne({ name: 'serviceStatus' });
        return serviceStatus && serviceStatus.open;
    },
    subject() {
        return Template.instance().state.get('subject');
    },
    onSubjectChange() {
        const state = Template.instance().state;
        return (subject, isAvailable) => {
            state.set('subject', subject);
            state.set('subjectIsAvailable', isAvailable);
        };
    },
    subjectIsAvailable() {
        return Template.instance().state.get('subjectIsAvailable');
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

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import mixpanel from '/imports/mixpanel.js';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { timeSince, getQueueTime } from '/imports/utils.js';

import './inQueue.html';
import './inQueue.less';

let interval;

Template.inQueue.onCreated(function() {
    this.state = new ReactiveDict();
    interval = Meteor.setInterval(() => {
        this.state.set('time', new Date());
    }, 1000);

    this.autorun(() => {
        const { params: { chatId } } = Router.current();
        this.subscribe('studentSessions.byId', chatId);
    });
});

Template.inQueue.onDestroyed(function() {
    Meteor.clearInterval(interval);
});

Template.inQueue.helpers({
    timeInQueue() {
        const { params: { chatId } } = Router.current();
        const session = StudentSessions.findOne(chatId);

        return session
            ? timeSince(
                  session.createdAt,
                  Template.instance().state.get('time') || new Date()
              )
            : '0:00';
    },
    text() {
        const { params: { chatId } } = Router.current();
        const session = StudentSessions.findOne(chatId);
        return session && session.text;
    },
    hasChanged() {
        const { params: { chatId } } = Router.current();
        const session = StudentSessions.findOne(chatId);
        if (!session || !session.temp) {
            return false;
        }
        return session.temp.text !== session.text;
    }
});

Template.inQueue.events({
    'click button.cancel'() {
        const { params: { chatId } } = Router.current();
        Meteor.call('studentSessions.delete', chatId);
        Router.go('/');
        mixpanel.track('Forlot leksehjelp-kø', {
            'Minutter i kø': getQueueTime(Session.get('queueStartTime')),
            type: 'chat'
        });
    },
    'input textarea[name=question]'(event) {
        const { params: { chatId } } = Router.current();
        Meteor.call('studentSessions.updateText', {
            sessionId: chatId,
            text: event.target.value
        });
    },
    'submit .extra-info-form'(event) {
        event.preventDefault();

        const { params: { chatId } } = Router.current();
        Meteor.call('studentSessions.save', chatId);
    }
});

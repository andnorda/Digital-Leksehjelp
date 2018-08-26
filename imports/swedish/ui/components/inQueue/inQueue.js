import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { STUDENT_SESSION_STATE } from '/imports/constants.js';
import { timeSince, getQueueTime } from '/imports/utils.js';
import '../topicsInput/topicsInput.js';
import '../select/select.js';
import '../formMessage/formMessage.js';

import './inQueue.html';
import './inQueue.less';

let interval;
let session;

Template.inQueue.onCreated(function() {
    this.state = new ReactiveDict();
    interval = Meteor.setInterval(() => {
        this.state.set('time', new Date());
    }, 1000);

    this.autorun(() => {
        const { params: { sessionId } } = Router.current();
        this.subscribe('studentSessions.byId', sessionId);

        const temp = StudentSessions.findOne(sessionId);
        if (session && !temp) {
            Router.go('/');
        }
        session = temp;
    });
});

Template.inQueue.onDestroyed(function() {
    Meteor.clearInterval(interval);
});

Template.inQueue.helpers({
    grades() {
        return [
            'Åk 7',
            'Åk 8',
            'Åk 9',
            'Gymnasiet åk 1',
            'Gymnasiet åk 2',
            'Gymnasiet åk 3'
        ];
    },
    grade() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.grade;
    },
    setGrade() {
        const { params: { sessionId } } = Router.current();
        return grade =>
            Meteor.call('studentSessions.setGrade', {
                sessionId,
                grade
            });
    },
    readyToStart() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.state === STUDENT_SESSION_STATE.READY;
    },
    videoLink() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.type === 'chat'
            ? `/chat/${sessionId}`
            : session.videoConferenceUrl;
    },
    theText() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.type === 'chat'
            ? 'Gå till chatten'
            : 'Gå till videosamtal';
    },
    target() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.type === 'chat' ? undefined : '_blank';
    },
    timeInQueue() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);

        return session
            ? timeSince(
                  session.createdAt,
                  Template.instance().state.get('time') || new Date()
              )
            : '0:00';
    },
    text() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.text;
    },
    updateButtonDisabled() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        if (!session || !session.temp) {
            return true;
        }
        return session.temp.text === session.text;
    },
    topics() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.topics;
    },
    removeTopic() {
        const { params: { sessionId } } = Router.current();
        return topic => {
            Meteor.call('studentSessions.removeTopic', {
                sessionId: sessionId,
                topic
            });
        };
    },
    addTopic() {
        const { params: { sessionId } } = Router.current();
        return topic => {
            Meteor.call('studentSessions.addTopic', {
                sessionId: sessionId,
                topic
            });
        };
    },
    subject() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.subject;
    },
    leaveQueue() {
        const { params: { sessionId } } = Router.current();
        return () => {
            Meteor.call('studentSessions.delete', sessionId);
            Router.go('/');
        };
    },
    infoMessage() {
        return Template.instance().state.get('infoMessage');
    }
});

Template.inQueue.events({
    'input textarea[name=question]'(event) {
        const { params: { sessionId } } = Router.current();
        Meteor.call('studentSessions.updateText', {
            sessionId: sessionId,
            text: event.target.value
        });
    },
    'submit .extra-info-form'(event) {
        event.preventDefault();

        const { params: { sessionId } } = Router.current();
        Meteor.call('studentSessions.save', sessionId);
        Template.instance().state.set(
            'infoMessage',
            'Den frivillige kan nu se din fråga. Du kan fortsätta redigera texten medan du väntar i kön.'
        );
    }
});

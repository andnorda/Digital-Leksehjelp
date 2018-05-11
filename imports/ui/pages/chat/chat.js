import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { STUDENT_SESSION_STATE } from '/imports/constants';

import '../../components/chat/chat.js';
import '../../components/inQueue/inQueue.js';
import '../../components/chatHeader/chatHeader.js';

import './chat.html';
import './chat.less';

Template.chat.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('isPending', !!Router.current().params.chatId);

    this.autorun(() => {
        const { params: { chatId } } = Router.current();

        if (chatId) {
            this.subscribe('studentSessions.byId', chatId);
            Meteor.call(
                'studentSessions.isValidId',
                chatId,
                (error, isValidId) => {
                    this.state.set('isPending', false);
                    this.state.set('isValidId', isValidId);
                }
            );

            const state = (StudentSessions.findOne(chatId) || {}).state;

            if (
                this.state.get('prevState') === STUDENT_SESSION_STATE.WAITING &&
                (state === STUDENT_SESSION_STATE.READY ||
                    state === STUDENT_SESSION_STATE.GETTING_HELP)
            ) {
                window.Notification &&
                    new Notification('Leksehjelpen er klar!');
            } else if (
                (this.state.get('prevState') === STUDENT_SESSION_STATE.READY ||
                    this.state.get('prevState') ===
                        STUDENT_SESSION_STATE.GETTING_HELP) &&
                state === STUDENT_SESSION_STATE.ENDED
            ) {
                window.showSurvey();
            }
            this.state.set('prevState', state);
        }
    });
});

Template.chat.helpers({
    isPending() {
        return Template.instance().state.get('isPending');
    },
    isValidId() {
        return Template.instance().state.get('isValidId');
    },
    isActive() {
        const { params: { chatId } } = Router.current();
        const session = StudentSessions.findOne(chatId);
        return session && session.volunteers && session.volunteers.length > 0;
    }
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import mixpanel from '/imports/mixpanel.js';
import { getQueueTime } from '/imports/utils.js';
import { STUDENT_SESSION_STATE } from '/imports/constants';

import Modal from '../../components/modal/modal.js';
import '../../components/chat/chat.js';
import '../../components/chatList/chatList.js';
import '../../components/addVolunteer/addVolunteer.js';

import './volunteerChat.html';
import './volunteerChat.less';

Template.volunteerChat.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('isPending', !!Router.current().params.sessionId);

    this.autorun(() => {
        const { params: { sessionId } } = Router.current();
        this.subscribe('studentSessions');

        if (sessionId) {
            this.state.set('isPending', true);
            Meteor.call(
                'studentSessions.isValidId',
                sessionId,
                (error, isValidId) => {
                    this.state.set('isPending', false);
                    this.state.set('isValidId', isValidId);
                }
            );
        }
    });
});

Template.volunteerChat.helpers({
    hasChats() {
        return StudentSessions.find({
            volunteers: { $elemMatch: { id: Meteor.userId() } },
            state: STUDENT_SESSION_STATE.READY
        }).count();
    },
    chatSelected() {
        const { params: { sessionId } } = Router.current();
        return sessionId;
    },
    nickname() {
        const { params: { sessionId } } = Router.current();
        const studentSession = StudentSessions.findOne(sessionId);
        return studentSession ? studentSession.nickname : '';
    },
    subject() {
        const { params: { sessionId } } = Router.current();
        const studentSession = StudentSessions.findOne(sessionId);
        return studentSession ? studentSession.subject : '';
    },
    grade() {
        const { params: { sessionId } } = Router.current();
        const studentSession = StudentSessions.findOne(sessionId);
        return studentSession ? studentSession.grade : '';
    },
    isPending() {
        return Template.instance().state.get('isPending');
    },
    isValidId() {
        return Template.instance().state.get('isValidId');
    }
});

Template.volunteerChatHeaderMenu.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('active', false);
    this.state.set('isAddVolunteerModalOpen', false);

    this.autorun(() => {
        this.subscribe('studentSessions');
    });
});

Template.volunteerChatHeaderMenu.helpers({
    isActive() {
        return Template.instance().state.get('active');
    },
    hasMoreVolunteers() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.volunteers && session.volunteers.length > 1;
    }
});

Template.volunteerChatHeaderMenu.events({
    'click .menu-button'() {
        const state = Template.instance().state;
        state.set('active', !state.get('active'));
    },
    'blur .menu-button'() {
        const state = Template.instance().state;
        state.set('active', false);
    },
    'keydown .menu-button'(event) {
        if ([' ', 'Enter'].includes(event.key)) {
            const state = Template.instance().state;
            state.set('active', !state.get('active'));
        }
    },
    'mousedown .menu-item.addVolunteer'() {
        Modal.show('addVolunteer');
    },
    'mousedown .menu-item.endSession'() {
        const { params: { sessionId } } = Router.current();
        Meteor.call('studentSessions.endTutoring', sessionId);

        const helpDurationMinutes = getQueueTime(
            Session.get('startTutoringTime')
        );
        if (helpDurationMinutes > 4) {
            mixpanel.track('Hjulpet elev', {
                'Minutter i samtale': helpDurationMinutes,
                type: 'chat'
            });
        }

        Router.go('/frivillig/chat');
    },
    'mousedown .menu-item.leaveChat'() {
        const { params: { sessionId } } = Router.current();
        Meteor.call('studentSessions.leaveChat', sessionId);
        Router.go('/frivillig/chat');
    }
});

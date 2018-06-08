import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import { Messages } from '/imports/api/messages/messages.js';
import { CONSTANTS, STUDENT_SESSION_STATE } from '/imports/constants.js';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';

import './chat.html';
import './chat.less';

import '../chatMessage/chatMessage.js';

Template.chatComponent.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        const { params: { sessionId } } = Router.current();
        this.subscribe('messages.bysessionId', sessionId);
        this.subscribe('studentSessions.byId', sessionId);

        const prevCount = this.state.get('messageCount');
        const count = Messages.find({ sessionId }).count();
        if (prevCount !== count) {
            setTimeout(() => {
                const element = $('.messages');
                element.scrollTop(element.prop('scrollHeight'));
            }, 0);
        }
        this.state.set('messageCount', count);
    });
});

Template.chatComponent.helpers({
    initialMessage() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.text;
    },
    subject() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.subject;
    },
    grade() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.grade;
    },
    isStudent() {
        return !Meteor.userId();
    },
    messages() {
        const { params: { sessionId } } = Router.current();
        return Messages.find({ sessionId }, { sort: { createdAt: 1 } });
    },
    hasEnded() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        return session && session.state === STUDENT_SESSION_STATE.ENDED;
    }
});

function isIe(userAgent) {
    return (
        userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident/') !== -1
    );
}

function isEdge(userAgent) {
    return userAgent.indexOf('Edge/') !== -1;
}

function isIeOrEdge(userAgent = window.navigator.userAgent) {
    return isIe(userAgent) || isEdge(userAgent);
}

const open = () => $('input.file').click();

Template.chatComponent.events({
    'submit form.messageForm'(event) {
        event.preventDefault();

        const input = $('input.chatField');
        const message = input.val();
        if (message) {
            const { params: { sessionId } } = Router.current();

            Meteor.call('messages.create', { sessionId, message });
            input.val('');
        }
    },
    'click button.upload'(event) {
        event.preventDefault();

        if (isIeOrEdge()) {
            setTimeout(open, 0);
        } else {
            open();
        }
    },
    'change .file'(event) {
        const { files } = event.target;

        if (files.length === 1) {
            if (files[0].size > CONSTANTS.S3_MAX_UPLOAD_FILE_SIZE) {
                FlashMessages.sendError('For stor fil. Maks 5 MB.');
            } else {
                S3.upload({ files, path: 'chat' }, function(error, result) {
                    event.target.value = null;
                    if (error) {
                        FlashMessages.sendError(
                            `Noe gikk galt ved opplastningen. Prøv igjen.\n${
                                error.message
                            }`
                        );
                    } else {
                        const { params: { sessionId } } = Router.current();
                        Meteor.call('messages.create', {
                            sessionId,
                            type: 'attachment',
                            message: result.file.original_name,
                            url: result.secure_url,
                            size: result.file.size
                        });
                    }
                });
            }
        }
    }
});

Template.messageForm.helpers({
    value() {
        const { params: { sessionId } } = Router.current();
        const session = StudentSessions.findOne(sessionId);
        const count = Messages.find({
            sessionId,
            author: null
        }).count();
        return (
            !Meteor.userId() &&
            !count &&
            session &&
            !session.text &&
            session.temp &&
            session.temp.text
        );
    }
});

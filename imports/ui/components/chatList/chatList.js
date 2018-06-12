import { Template } from 'meteor/templating';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { STUDENT_SESSION_STATE } from '/imports/constants';

import './chatList.html';
import './chatList.less';

Template.chatList.onCreated(function() {
    this.autorun(() => {
        this.subscribe('studentSessions');
    });
});

Template.chatList.helpers({
    chats() {
        return StudentSessions.find({
            volunteers: { $elemMatch: { id: Meteor.userId() } },
            type: 'chat',
            state: STUDENT_SESSION_STATE.READY
        });
    }
});

Template.chatListItem.helpers({
    notifications() {
        return this.volunteers.find(
            volunteer => volunteer.id === Meteor.userId()
        ).unread;
    },
    isActive() {
        const { params: { sessionId } } = Router.current();
        return this._id === sessionId;
    },
    studentPresent() {
        const session = StudentSessions.findOne(this._id);
        return session && session.studentPresent;
    }
});

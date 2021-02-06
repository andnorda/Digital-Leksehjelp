import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { STUDENT_SESSION_STATE } from '/imports/constants';

import './description.html';
import './description.less';

Template.chat.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        const { params: { sessionId } } = Router.current();

        if (sessionId) {
            this.subscribe('studentSessions.byId', sessionId);
        }
    });
});

Template.chat.helpers({
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { ROLES, STUDENT_SESSION_STATE } from '/imports/constants';

import './loggedInHeader.html';

Template.loggedInHeader.onCreated(function loggedInHeaderOnCreated() {
    this.autorun(() => {
        this.subscribe('studentSessions');
    });
});

Template.loggedInHeader.helpers({
    currentUserEmail() {
        return Meteor.user().username;
    },
    isActiveTab(route) {
        return Router.current().route.getName() === route && 'active';
    },
    isAdmin() {
        return Meteor.user().profile.role === ROLES.ADMIN;
    },
    isVideohelper() {
        const user = Meteor.user();
        return user.profile.role === ROLES.ADMIN || user.profile.allowVideohelp;
    },
    numberOfStudentsWaitingInQueue() {
        const number = StudentSessions.find({
            state: STUDENT_SESSION_STATE.WAITING
        }).count();

        return number > 0 && ` (${number} i kø)`;
    }
});

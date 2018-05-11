import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { ROLES, STUDENT_SESSION_STATE } from '/imports/constants';

import './loggedInHeader.html';

Template.loggedInHeader.onCreated(function() {
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
    numberOfStudentsWaitingInQueue() {
        const number = StudentSessions.find({
            state: STUDENT_SESSION_STATE.WAITING
        }).count();

        return number > 0 && ` (${number} i kø)`;
    },
    notificationCount() {
        return StudentSessions.find({ 'volunteers.id': Meteor.userId() })
            .map(
                session =>
                    session.volunteers.find(
                        volunteer => volunteer.id === Meteor.userId()
                    ).unread
            )
            .reduce((sum, count) => sum + count, 0);
    }
});

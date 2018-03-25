import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { ROLES, STUDENT_SESSION_STATE } from '/imports/constants';

import './loggedInHeader.html';

Template.loggedInHeader.helpers({
    currentUserEmail: function() {
        return Meteor.user().username;
    },
    isActiveTab: function(route) {
        if (Router.current().route.getName() === route) {
            return 'active';
        }
    },
    isAdmin: function() {
        return Meteor.user().profile.role === ROLES.ADMIN;
    },
    isVideohelper: function() {
        var user = Meteor.user();
        return user.profile.role === ROLES.ADMIN || user.profile.allowVideohelp;
    },
    numberOfStudentsWaitingInQueue: function() {
        var number = StudentSessions.find({
            state: STUDENT_SESSION_STATE.WAITING
        }).count();

        if (number > 0) {
            return ' (' + number + ' i kø)';
        }
    }
});

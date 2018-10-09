import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { Config } from '/imports/api/config/config.js';
import { STUDENT_SESSION_STATE } from '/imports/constants';
import '../notificationsBadge/notificationsBadge.js';

import './loggedInHeader.html';
import './loggedInHeader.less';

Template.loggedInHeader.onCreated(function() {
  this.autorun(() => {
    this.subscribe('studentSessions');
    this.subscribe('config.serviceStatus');

    document.title = `${StudentSessions.find({
      state: STUDENT_SESSION_STATE.WAITING
    }).count()} i kö`;
  });
});

Template.loggedInHeader.helpers({
  serviceIsOpen() {
    const serviceStatus = Config.findOne({ name: 'serviceStatus' });
    return serviceStatus ? serviceStatus.open : false;
  },
  isActiveTab(route) {
    return (
      Router.current().route.getName() === route ||
      Router.current()
        .route.getName()
        .toLowerCase()
        .endsWith(route)
    );
  },
  numberOfStudentsWaitingInQueue() {
    return StudentSessions.find({
      state: STUDENT_SESSION_STATE.WAITING
    }).count();
  },
  notificationCount() {
    return StudentSessions.find({
      'volunteers.id': Meteor.userId(),
      state: { $ne: STUDENT_SESSION_STATE.ENDED }
    })
      .map(
        session =>
          session.volunteers.find(volunteer => volunteer.id === Meteor.userId())
            .unread
      )
      .reduce((sum, count) => sum + count, 0);
  }
});

Template.loggedInHeader.events({
  'click .log-out'(event) {
    event.preventDefault();

    Meteor.logout();
    Router.go('/');
  },
  'click .open-service'(event) {
    event.preventDefault();

    if (confirm('Är du säker på att du vill öppna läxhjälpen?')) {
      Meteor.call('config.openService');
    }
  },
  'click .close-service'(event) {
    event.preventDefault();

    if (confirm('Är du säker på att du vill stänga läxhjälpen?')) {
      Meteor.call('config.closeService');
    }
  }
});

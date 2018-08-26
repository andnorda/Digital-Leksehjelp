import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import './endSessionModal.html';

Template.endSessionModal.events({
    'click button#deleteSessionFromModal'() {
        Meteor.call('studentSessions.delete', Session.get('studentSessionId'));
    }
});

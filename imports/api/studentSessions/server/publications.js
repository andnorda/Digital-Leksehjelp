import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { StudentSessions } from '../studentSessions.js';

Meteor.publish('studentSessions', function() {
    if (!this.userId) {
        return this.ready();
    }

    return StudentSessions.find({ state: { $ne: 'Ferdig' } });
});

Meteor.publish('studentSessions.byId', function(sessionId) {
    check(sessionId, Match.OneOf(String, null));

    return StudentSessions.find({ _id: sessionId });
});

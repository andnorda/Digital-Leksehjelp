import { StudentSessions } from '../studentSessions.js';

import { STUDENT_SESSION_STATE } from '/imports/constants.js';

Meteor.publish('studentSessions.queue', function() {
    var self = this;
    var id = Random.id();
    var handle = StudentSessions.find({
        state: STUDENT_SESSION_STATE.WAITING
    }).observeChanges({
        added: function(id, fields) {
            self.added('studentSessions.queue', id, {
                queueNr: fields.queueNr,
                subject: fields.subject
            });
        },
        removed: function(id) {
            self.removed('studentSessions.queue', id);
        }
    });

    self.ready();

    self.onStop(function() {
        handle.stop();
    });
});

Meteor.publish('studentSessions', function(sessionId) {
    var user = Meteor.users.findOne(this.userId);
    if (!user) {
        check(sessionId, Match.OneOf(String, null));
        return StudentSessions.find({ _id: sessionId });
    }

    return StudentSessions.find({});
});

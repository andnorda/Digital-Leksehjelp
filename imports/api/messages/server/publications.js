import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Messages } from '../messages.js';
import { StudentSessions } from '../../studentSessions/studentSessions.js';

const NonEmptyString = Match.Where(x => {
    check(x, String);
    return x.length > 0;
});

Meteor.publish('messages.bysessionId', function(sessionId) {
    check(sessionId, NonEmptyString);

    const userId = this.userId;

    if (userId) {
        const observer = Messages.find({ sessionId }).observe({
            added() {
                StudentSessions.update(
                    { _id: sessionId, 'volunteers.id': userId },
                    { $set: { 'volunteers.$.unread': 0 } }
                );
            }
        });
        this.onStop(() => observer.stop());
    } else {
        StudentSessions.update(
            { _id: sessionId },
            { $set: { studentPresent: true } }
        );
        this.onStop(() =>
            StudentSessions.update(
                { _id: sessionId },
                { $set: { studentPresent: false } }
            )
        );
    }

    return Messages.find({ sessionId });
});

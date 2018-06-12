import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Messages } from './messages.js';
import { StudentSessions } from '../studentSessions/studentSessions.js';

const NonEmptyString = Match.Where(x => {
    check(x, String);
    return x.length > 0;
});

Meteor.methods({
    'messages.create'({ message, sessionId, type = 'text', url, size }) {
        check(message, NonEmptyString);
        check(sessionId, NonEmptyString);
        check(type, NonEmptyString);
        check(url, Match.Optional(NonEmptyString));
        check(size, Match.Optional(Number));

        if (type !== 'info') {
            StudentSessions.update(
                {
                    _id: sessionId,
                    'volunteers.id': this.userId
                        ? { $ne: this.userId }
                        : { $exists: true }
                },
                { $inc: { 'volunteers.$.unread': 1 } }
            );
        }

        if (!this.userId) {
            StudentSessions.update(
                { _id: sessionId },
                { $set: { studentPresent: true } }
            );
        }

        return Messages.insert({
            message,
            sessionId,
            type,
            url,
            size,
            createdAt: new Date(),
            author: Meteor.userId()
        });
    }
});

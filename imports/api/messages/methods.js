import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Messages } from './messages.js';
import { StudentSessions } from '../studentSessions/studentSessions.js';

const NonEmptyString = Match.Where(x => {
    check(x, String);
    return x.length > 0;
});

Meteor.methods({
    'messages.create'({ message, chatId, type = 'text', url, size }) {
        check(message, NonEmptyString);
        check(chatId, NonEmptyString);
        check(type, NonEmptyString);
        check(url, Match.Optional(NonEmptyString));
        check(size, Match.Optional(Number));

        if (type !== 'info') {
            StudentSessions.update(
                {
                    _id: chatId,
                    'volunteers.id': this.userId
                        ? { $ne: this.userId }
                        : { $exists: true }
                },
                { $inc: { 'volunteers.$.unread': 1 } }
            );
        }

        return Messages.insert({
            message,
            chatId,
            type,
            url,
            size,
            createdAt: new Date(),
            author: Meteor.userId()
        });
    }
});

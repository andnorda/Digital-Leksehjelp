import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Messages } from '../messages.js';
import { StudentSessions } from '../../studentSessions/studentSessions.js';

const NonEmptyString = Match.Where(x => {
    check(x, String);
    return x.length > 0;
});

Meteor.publish('messages.byChatId', function(chatId) {
    check(chatId, NonEmptyString);

    const userId = this.userId;

    if (userId) {
        const observer = Messages.find({ chatId }).observe({
            added() {
                StudentSessions.update(
                    { _id: chatId, 'volunteers.id': userId },
                    { $set: { 'volunteers.$.unread': 0 } }
                );
            }
        });
        this.onStop(() => observer.stop());
    }

    return Messages.find({ chatId });
});

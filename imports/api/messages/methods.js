import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import mixpanel from '/imports/startup/server/mixpanelServer';
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
            const isVolunteer = StudentSessions.findOne({
                _id: sessionId,
                'volunteers.id': this.userId
            });

            StudentSessions.update(
                {
                    _id: sessionId,
                    'volunteers.id':
                        this.userId && isVolunteer
                            ? { $ne: this.userId }
                            : { $exists: true }
                },
                { $inc: { 'volunteers.$.unread': 1 } }
            );
        }

        if (!this.userId) {
            StudentSessions.update(
                { _id: sessionId },
                {
                    $set: { studentPresent: true },
                    $unset: { lastStudentActivity: '' }
                }
            );
        } else {
            StudentSessions.update(
                {
                    _id: sessionId,
                    'volunteers.id': this.userId
                },
                { $unset: { 'volunteers.$.lastActivity': '' } }
            );
        }

        if (
            Meteor.isServer &&
            Messages.findOne({
                sessionId
            }) &&
            !Messages.findOne({
                sessionId,
                author: this.userId ? { $ne: null } : null
            })
        ) {
            const session = StudentSessions.findOne(sessionId);

            mixpanel.track('Melding fra elev og frivillig (server)', {
                fag: session.subject,
                grade: session.grade
            });
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

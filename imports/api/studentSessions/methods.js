import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { STUDENT_SESSION_STATE } from '/imports/constants.js';
import { generateNickname } from '/imports/utils.js';
import { StudentSessions } from './studentSessions.js';
import { Subjects } from '../subjects/subjects.js';
import { Messages } from '../messages/messages.js';

const generateRandomAppearInLink = function() {
    const randomId = Math.floor(Math.random() * 1000000000);
    return `http://appear.in/${randomId}`;
};

Meteor.methods({
    'studentSessions.addTopic'({ sessionId, topic }) {
        check(sessionId, String);
        check(topic, String);

        StudentSessions.update(
            { _id: sessionId },
            { $addToSet: { topics: topic } }
        );
    },

    'studentSessions.removeTopic'({ sessionId, topic }) {
        check(sessionId, String);
        check(topic, String);

        StudentSessions.update(
            { _id: sessionId },
            { $pull: { topics: topic } }
        );
    },

    'studentSessions.endTutoring'(sessionId) {
        check(sessionId, String);

        StudentSessions.update(
            { _id: sessionId },
            { $set: { state: STUDENT_SESSION_STATE.ENDED } }
        );
    },

    'studentSessions.delete'(sessionId) {
        check(sessionId, String);

        StudentSessions.remove({ _id: sessionId });
    },

    'studentSessions.updateText'({ sessionId, text }) {
        check(sessionId, String);
        check(text, String);

        StudentSessions.update(
            { _id: sessionId },
            { $set: { 'temp.text': text } }
        );
    },

    'studentSessions.save'(sessionId) {
        check(sessionId, String);

        const session = StudentSessions.findOne(sessionId);

        if (!session) {
            throw new Meteor.Error(400, 'Invalid sessionId');
        }

        StudentSessions.update(
            { _id: sessionId },
            { $set: { text: session.temp && session.temp.text } }
        );
    },

    'studentSessions.startTutoring'(sessionId) {
        check(sessionId, String);

        if (!this.userId) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        StudentSessions.update(
            { _id: sessionId },
            {
                $set: {
                    state: STUDENT_SESSION_STATE.READY,
                    volunteers: [{ id: this.userId, unread: 0 }]
                }
            }
        );
    },

    'studentSessions.getHelp'(sessionId) {
        check(sessionId, String);

        StudentSessions.update(
            { _id: sessionId },
            { $set: { state: STUDENT_SESSION_STATE.GETTING_HELP } }
        );
    },

    'studentSessions.create'({ subject, type }) {
        check(subject, String);
        check(type, String);

        const videoConferenceUrl = generateRandomAppearInLink();

        Subjects.update({ name: subject }, { $inc: { chatCount: 1 } });

        return StudentSessions.insert({
            subject,
            type,
            videoConferenceUrl,
            state: STUDENT_SESSION_STATE.WAITING,
            createdAt: new Date(),
            nickname: generateNickname(),
            topics: []
        });
    },

    'studentSessions.leaveChat'(sessionId) {
        check(sessionId, String);

        if (!this.userId) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        StudentSessions.update(
            { _id: sessionId },
            { $pull: { volunteers: { id: this.userId } } },
            () => {
                if (
                    StudentSessions.findOne(sessionId).volunteers.length === 0
                ) {
                    StudentSessions.remove({ _id: sessionId });
                } else {
                    Meteor.call('messages.create', {
                        message: `${
                            Meteor.users.findOne(this.userId).profile.firstName
                        } har forlatt chatten`,
                        sessionId: sessionId,
                        type: 'info'
                    });
                }
            }
        );
    },

    'studentSessions.addVolunteer'(sessionId, id) {
        check(sessionId, String);
        check(id, String);

        if (!this.userId) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        const volunteerIsInSession = StudentSessions.findOne({
            _id: sessionId,
            'volunteers.id': id
        });

        if (!volunteerIsInSession) {
            StudentSessions.update(
                { _id: sessionId },
                {
                    $push: {
                        volunteers: {
                            id,
                            unread: Messages.find({ sessionId }).count()
                        }
                    }
                }
            );
            Meteor.call('messages.create', {
                message: `${
                    Meteor.users.findOne(id).profile.firstName
                } har blitt lagt til i chatten`,
                sessionId: sessionId,
                type: 'info'
            });
        }
    },

    'studentSessions.isValidId'(id) {
        check(id, String);

        return !!StudentSessions.findOne(id);
    },

    'studentSessions.setLastActivity'(sessionId) {
        check(sessionId, String);

        if (this.userId) {
            StudentSessions.update(
                { _id: sessionId, 'volunteers.id': this.userId },
                { $set: { 'volunteers.$.lastActivity': new Date() } }
            );
        } else {
            StudentSessions.update(
                { _id: sessionId },
                {
                    $set: {
                        lastStudentActivity: new Date(),
                        studentPresent: true
                    }
                }
            );
        }
    }
});

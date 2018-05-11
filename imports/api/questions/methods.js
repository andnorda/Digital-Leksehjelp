import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Match, check } from 'meteor/check';
import mixpanel from '/imports/mixpanel';
import { urlify } from '/imports/utils.js';
import { Questions } from './questions.js';
import QuestionHelpers from './questionHelpers.js';

const generateUniqueSlug = title => {
    const originalSlug = urlify(title);
    let slug = originalSlug;
    let slugSeed = 1;

    let question = Questions.findOne({ slug });
    while (question) {
        slugSeed += 1;
        slug = `${originalSlug}-${slugSeed}`;
        question = Questions.findOne({ slug });
    }

    return slug;
};

Meteor.methods({
    'questions.ask'(options) {
        check(options.subjectId, String);
        check(options.grade, String);
        check(options.studentEmail, String);
        check(options.attachmentUrl, Match.Optional(String));
        if (options.studentEmail.length < 1) {
            throw new Meteor.Error(
                400,
                'Email address must contain at least one character'
            );
        }
        if (options.subjectId === 'default') {
            throw new Meteor.Error(400, 'Subject id can not be "default"');
        }
        if (options.grade === 'default') {
            throw new Meteor.Error(400, 'Grade can not be "default"');
        }

        const question = {
            subjectId: options.subjectId,
            grade: options.grade,
            question: options.question,
            questionDate: new Date(),
            studentEmail: options.studentEmail
        };

        if (options.attachmentUrl) {
            question.attachmentUrl = options.attachmentUrl;
        }

        Questions.insert(question, function(error) {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            }

            if (Meteor.isClient) {
                mixpanel.track('Nytt spørsmål stilt');
            }
        });
    },

    'questions.updateFromVolunteerMiniForm'(options) {
        check(options.questionId, String);
        check(options.title, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        const question = Questions.findOne({ _id: options.questionId });
        if (!question) {
            throw new Meteor.Error(
                404,
                `Question with id ${options.questionId} does not exist.`
            );
        }
        if (!question.answeredBy) {
            throw new Meteor.Error(
                404,
                `Question with id ${
                    options.questionId
                } does not have an answer yet.`
            );
        }

        const updateDoc = {
            $set: {
                title: options.title,
                lastUpdatedBy: this.userId,
                lastUpdatedDate: new Date()
            }
        };

        if (options.publishAnswer) {
            updateDoc.$set.publishedBy = this.userId;
        } else {
            updateDoc.$unset = { publishedBy: '' };
        }

        if (Meteor.isServer) {
            if (options.title && options.title.length > 0 && !question.slug) {
                updateDoc.$set.slug = generateUniqueSlug(options.title);
            }
        }

        Questions.update({ _id: options.questionId }, updateDoc);

        if (Meteor.isClient) {
            mixpanel.track('Spørsmål redigert', {
                frivillig: user.username
            });
        }
    },

    'questions.answer'(options) {
        check(options.questionId, String);
        check(options.title, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        const question = Questions.findOne({ _id: options.questionId });
        if (!question) {
            throw new Meteor.Error(
                404,
                `Question with id ${options.questionId} does not exist.`
            );
        }

        const updateDoc = {
            $set: {
                question: options.question,
                answer: options.answer,
                title: options.title,
                lastUpdatedBy: this.userId,
                lastUpdatedDate: new Date()
            }
        };

        if (!question.answeredBy) {
            if (Meteor.isClient) {
                mixpanel.track('Spørsmål besvart', {
                    frivillig: user.username
                });
            }
            updateDoc.$set.answeredBy = this.userId;
            updateDoc.$set.answerDate = new Date();
        } else if (Meteor.isClient) {
            mixpanel.track('Spørsmål redigert', {
                frivillig: user.username
            });
        }

        if (options.publishAnswer) {
            updateDoc.$set.publishedBy = this.userId;
        } else {
            updateDoc.$unset = { publishedBy: '' };
        }

        if (options.answerAttachmentUrl) {
            updateDoc.$set.answerAttachmentUrl = options.answerAttachmentUrl;
        }

        if (Meteor.isServer) {
            if (options.title && options.title.length > 0 && !question.slug) {
                updateDoc.$set.slug = generateUniqueSlug(options.title);
            }
        }

        Questions.update({ _id: options.questionId }, updateDoc);
    },

    'questions.verify'(options) {
        check(options.questionId, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        const question = Questions.findOne({ _id: options.questionId });
        if (!question) {
            throw new Meteor.Error(
                404,
                `Question with id ${options.questionId} does not exist.`
            );
        }
        if (!question.answeredBy) {
            throw new Meteor.Error(
                404,
                `Question with id ${
                    options.questionId
                } does not have an answer yet.`
            );
        }
        if (question.lastUpdatedBy === this.userId) {
            throw new Meteor.Error(
                403,
                'You are not allowed to verify this answer because you were the last one to edit it.'
            );
        }

        Questions.update(
            { _id: options.questionId },
            {
                $set: {
                    verifiedBy: this.userId
                }
            }
        );

        if (Meteor.isClient) {
            mixpanel.track('Spørsmål godkjent', {
                frivillig: user.username
            });
        }

        if (question.studentEmail) {
            Meteor.call('questions.sendAnswerEmail', question);
        }
    },

    'questions.setEditing'(options) {
        check(options, {
            questionId: String,
            editing: Boolean
        });

        if (!this.userId) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        if (options.editing) {
            Questions.update(
                { _id: options.questionId },
                { $addToSet: { editing: this.userId } }
            );
        } else {
            Questions.update(
                { _id: options.questionId },
                { $pull: { editing: this.userId } }
            );
        }
    },

    'questions.sendAnswerEmail'(question) {
        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        this.unblock();

        const html = SSR.render('answerEmailTemplate', question);

        Email.send({
            to: question.studentEmail,
            from: 'Digital Leksehjelp <digitalleksehjelp@oslo.redcross.no>',
            subject: 'Røde Kors - Digital Leksehjelp',
            html
        });

        Questions.update(
            { _id: question._id },
            { $unset: { studentEmail: '' } }
        );
    }
});

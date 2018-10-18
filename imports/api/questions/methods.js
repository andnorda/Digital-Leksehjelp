import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Match, check } from 'meteor/check';
import mixpanel from '/imports/mixpanel';
import { urlify } from '/imports/utils.js';
import { generateNickname } from '/imports/utils.js';
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

const NonEmptyString = Match.Where(x => {
    check(x, String);
    return x.length > 0;
});

Meteor.methods({
    'questions.ask'({
        subject,
        topics,
        grade,
        question,
        attachments,
        studentEmail,
        allowPublish
    }) {
        check(subject, NonEmptyString);
        check(grade, NonEmptyString);
        check(question, NonEmptyString);
        check(studentEmail, NonEmptyString);

        return Questions.insert({
            subject,
            topics,
            grade,
            question,
            attachments,
            studentEmail,
            allowPublish,
            questionDate: new Date(),
            nickname: generateNickname(studentEmail)
        });
    },

    'questions.update'({
        id,
        title,
        subject,
        topics,
        question,
        answer,
        answerAttachments
    }) {
        check(subject, NonEmptyString);
        check(title, String);
        check(question, String);
        check(answer, String);

        Questions.update(
            { _id: id },
            {
                $set: {
                    title,
                    subject,
                    topics,
                    question,
                    answer,
                    answerAttachments
                }
            }
        );

        const hasEditedBefore = !!Questions.findOne({
            _id: id,
            'editedBy.id': this.userId
        });

        if (hasEditedBefore) {
            Questions.update(
                { _id: id, 'editedBy.id': this.userId },
                { $set: { 'editedBy.$.date': new Date() } }
            );
        } else {
            Questions.update(
                { _id: id },
                { $push: { editedBy: { id: this.userId, date: new Date() } } }
            );
        }
    },

    'questions.submitForApproval'(questionId) {
        if (!Meteor.users.findOne(this.userId)) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Questions.update(
            { _id: questionId },
            { $set: { submittedForApprovalBy: this.userId } }
        );
    },

    'questions.approve'(questionId, options = { publish: false }) {
        check(questionId, String);

        if (!Meteor.users.findOne(this.userId)) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        const question = Questions.findOne({ _id: questionId });

        if (question.studentEmail) {
            this.unblock();

            const html = SSR.render('answerEmailTemplate', question);

            Email.send({
                to: question.studentEmail,
                from: 'Digital Leksehjelp <digitalleksehjelp@oslo.redcross.no>',
                subject: 'Røde Kors - Digital Leksehjelp',
                html
            });
        }

        Questions.update(
            { _id: questionId },
            {
                $set: Object.assign(
                    { approvedBy: this.userId },
                    options.publish ? { publishedBy: this.userId } : {}
                ),
                $unset: { studentEmail: '' }
            }
        );
    },

    'questions.publish'(questionId) {
        check(questionId, String);

        if (!Meteor.users.findOne(this.userId)) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        return Questions.update(questionId, {
            $set: { publishedBy: this.userId }
        });
    },

    'questions.unpublish'(questionId) {
        check(questionId, String);

        if (!Meteor.users.findOne(this.userId)) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        return Questions.update(questionId, { $unset: { publishedBy: '' } });
    },

    'questions.delete'(id) {
        check(id, String);

        if (!Meteor.users.findOne(this.userId)) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Questions.remove(id);
    }
});

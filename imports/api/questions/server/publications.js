import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Match, check } from 'meteor/check';
import { QUESTION_SUBSCRIPTION_LEVEL, CONSTANTS } from '/imports/constants.js';
import { ADMIN } from '/imports/userRoles.js';
import {
    Questions,
    questionPrivateFields,
    questionPublicFields
} from '../questions.js';
import QuestionHelpers from '../questionHelpers.js';

Meteor.publish('questions.search', function({
    query,
    subject,
    grade,
    sortType,
    offset
}) {
    return QuestionHelpers.search({
        query,
        subject,
        grade,
        sortType,
        offset,
        limit: CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE,
        userId: this.userId
    });
});

const MAX_QUESTIONS = 10000;

Meteor.publish('questions.verifiedPublished', function(limit) {
    check(limit, Match.Integer);

    if (!this.userId) {
        return this.ready();
    }

    const user = Meteor.users.findOne(this.userId);
    if (user.profile.role !== ADMIN) {
        return this.ready();
    }

    return Questions.find(
        {
            approvedBy: { $exists: true },
            publishedBy: { $exists: true }
        },
        {
            sort: { questionDate: -1 },
            limit: Math.min(limit, MAX_QUESTIONS),
            fields: questionPrivateFields
        }
    );
});

Meteor.publish('questions.verifiedUnpublished', function(limit) {
    check(limit, Match.Integer);

    if (!this.userId) {
        return this.ready();
    }

    const user = Meteor.users.findOne(this.userId);
    if (user.profile.role !== ADMIN) {
        return this.ready();
    }

    return Questions.find(
        {
            approvedBy: { $exists: true },
            publishedBy: { $exists: false }
        },
        {
            sort: { questionDate: -1 },
            limit: Math.min(limit, MAX_QUESTIONS),
            fields: questionPrivateFields
        }
    );
});

Meteor.publish('questions.verifiedPublishedCount', function() {
    Counts.publish(
        this,
        'questions.verifiedPublishedCount',
        Questions.find({
            approvedBy: { $exists: true },
            publishedBy: { $exists: true }
        })
    );
});

Meteor.publish('questions.verifiedUnpublishedCount', function() {
    Counts.publish(
        this,
        'questions.verifiedUnpublishedCount',
        Questions.find({
            approvedBy: { $exists: true },
            publishedBy: { $exists: false }
        })
    );
});

Meteor.publish('questions', function(subscriptionLevel) {
    if (this.userId) {
        const user = Meteor.users.findOne(this.userId);

        if (
            subscriptionLevel === QUESTION_SUBSCRIPTION_LEVEL.ALL &&
            user.profile.role === ADMIN
        ) {
            return Questions.find(
                {},
                {
                    fields: questionPrivateFields
                }
            );
        } else if (subscriptionLevel === QUESTION_SUBSCRIPTION_LEVEL.REGULAR) {
            return Questions.find({
                $or: [
                    { answer: { $exists: false } },
                    {
                        $and: [
                            { answer: { $exists: true } },
                            { approvedBy: { $exists: false } }
                        ]
                    }
                ]
            });
        }
    }

    this.ready();
});

Meteor.publish('questions.bySlugOrId', function(
    questionId,
    options = { editing: false }
) {
    check(questionId, String);

    if (this.userId) {
        if (options.editing) {
            Questions.update(
                { _id: questionId },
                { $addToSet: { editing: this.userId } }
            );
        }

        this.onStop(function() {
            if (options.editing) {
                Questions.update(
                    { _id: questionId },
                    { $pull: { editing: this.userId } }
                );
            }
        });

        return Questions.find({
            $or: [{ slug: questionId }, { _id: questionId }]
        });
    } else {
        return Questions.find(
            {
                $or: [{ slug: questionId }, { _id: questionId }],
                answer: { $exists: true },
                approvedBy: { $exists: true },
                publishedBy: { $exists: true }
            },
            {
                fields: questionPublicFields
            }
        );
    }
});

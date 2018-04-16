import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Match, check } from 'meteor/check';
import {
    ROLES,
    QUESTION_SUBSCRIPTION_LEVEL,
    CONSTANTS
} from '/imports/constants';
import { generateNickname } from '/imports/utils.js';
import {
    Questions,
    questionPrivateFields,
    questionPublicFields
} from '../questions.js';
import QuestionHelpers from '../questionHelpers.js';

Meteor.publish('questions.search', function(params) {
    params.limit = CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE;
    return QuestionHelpers.search(params, this.userId);
});

const MAX_QUESTIONS = 10000;

Meteor.publish('questions.verified', function(limit) {
    check(limit, Match.Integer);

    if (!this.userId) {
        return this.ready();
    }

    const user = Meteor.users.findOne(this.userId);
    if (user.profile.role !== ROLES.ADMIN) {
        return this.ready();
    }

    return Questions.find(
        {
            verifiedBy: { $exists: true }
        },
        {
            sort: { questionDate: -1 },
            limit: Math.min(limit, MAX_QUESTIONS),
            fields: questionPrivateFields
        }
    );
});

Meteor.publish('questions.verifiedCount', function() {
    Counts.publish(
        this,
        'questions.verifiedCount',
        Questions.find({ verifiedBy: { $exists: true } })
    );
});

Meteor.publish('questions', function(subscriptionLevel) {
    if (this.userId) {
        const user = Meteor.users.findOne(this.userId);

        if (
            subscriptionLevel === QUESTION_SUBSCRIPTION_LEVEL.ALL &&
            user.profile.role === ROLES.ADMIN
        ) {
            return Questions.find(
                {},
                {
                    fields: questionPrivateFields
                }
            );
        } else if (subscriptionLevel === QUESTION_SUBSCRIPTION_LEVEL.REGULAR) {
            const transform = function(doc) {
                doc.nickname = generateNickname(doc.studentEmail);
                delete doc.studentEmail;
                return doc;
            };

            const self = this;

            const observer = Questions.find({
                $or: [
                    { answer: { $exists: false } },
                    {
                        $and: [
                            { answer: { $exists: true } },
                            { verifiedBy: { $exists: false } }
                        ]
                    }
                ]
            }).observe({
                added(document) {
                    self.added('questions', document._id, transform(document));
                },
                changed(newDocument, oldDocument) {
                    self.changed(
                        'questions',
                        newDocument._id,
                        transform(newDocument)
                    );
                },
                removed(oldDocument) {
                    self.removed('questions', oldDocument._id);
                }
            });

            self.onStop(function() {
                observer.stop();
            });

            self.ready();
        }
    }

    this.ready();
});

Meteor.publish('questions.bySlugOrId', function(questionId) {
    check(questionId, String);

    if (this.userId) {
        return Questions.find(
            {
                $or: [{ slug: questionId }, { _id: questionId }]
            },
            {
                fields: questionPrivateFields
            }
        );
    }
    return Questions.find(
        {
            $or: [{ slug: questionId }, { _id: questionId }],
            answer: { $exists: true },
            verifiedBy: { $exists: true },
            publishedBy: { $exists: true }
        },
        {
            fields: questionPublicFields
        }
    );
});

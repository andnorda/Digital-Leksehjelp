Meteor.publish('questionSearch', function(params) {
    params['limit'] = CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE;
    return QuestionHelpers.search(params, this.userId);
});

Meteor.publish('verifiedQuestions', function(page) {
    if (this.userId) {
        const user = Meteor.users.findOne(this.userId);

        if (user.profile.role === ROLES.ADMIN) {
            const questionsPerPage = 20;

            return Questions.find(
                {
                    verifiedBy: { $exists: true }
                },
                {
                    fields: questionPrivateFields,
                    limit: questionsPerPage,
                    skip: page * questionsPerPage,
                    sort: { questionDate: -1 }
                }
            );
        }
    }

    this.ready();
});

Meteor.publish('questions', function(subscriptionLevel) {
    if (this.userId) {
        var user = Meteor.users.findOne(this.userId);

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
            return Questions.find(
                {
                    $or: [
                        { answer: { $exists: false } },
                        {
                            $and: [
                                { answer: { $exists: true } },
                                { verifiedBy: { $exists: false } }
                            ]
                        }
                    ]
                },
                {
                    fields: questionPrivateFields
                }
            );
        }
    }

    this.ready();
});

Meteor.publish('question', function(questionId) {
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
    } else {
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
    }
});

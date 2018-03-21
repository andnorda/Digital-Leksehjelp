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

const adjectives = [
    'Subtil',
    'Glad',
    'Sjenert',
    'Rosa',
    'Lilla',
    'Nysgjerrig',
    'Løye',
    'Flink',
    'Rask',
    'Praktisk',
    'Koselig',
    'Ivrig',
    'Listig',
    'Snill',
    'Genial',
    'Imponerende',
    'Rakrygget',
    'Vennlig',
    'Berømt',
    'Positiv',
    'Arbeidsom',
    'Lun',
    'Oppmerksom',
    'Bestemt'
];

const animals = [
    'panda',
    'sjiraff',
    'frosk',
    'elefant',
    'elg',
    'ugle',
    'tiger',
    'bjørn',
    'løve',
    'ørn',
    'krokodille',
    'delfin',
    'zebra',
    'hare',
    'rev',
    'kamel',
    'hai',
    'gorilla',
    'papegøye',
    'flamingo',
    'grevling',
    'sel',
    'pingvin',
    'kenguru'
];

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
            var transform = function(doc) {
                const n =
                    CryptoJS.MD5(doc.studentEmail.toLowerCase())
                        .toString()
                        .split('')
                        .reduce(function(sum, char) {
                            return char.charCodeAt(0) + sum;
                        }, 0) %
                    (animals.length * adjectives.length);
                doc.nickname =
                    adjectives[Math.floor(n / animals.length)] +
                    ' ' +
                    animals[n % animals.length];
                delete doc.studentEmail;
                return doc;
            };

            var self = this;

            var observer = Questions.find({
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
                added: function(document) {
                    self.added('questions', document._id, transform(document));
                },
                changed: function(newDocument, oldDocument) {
                    self.changed(
                        'questions',
                        newDocument._id,
                        transform(newDocument)
                    );
                },
                removed: function(oldDocument) {
                    self.removed('collection_name', oldDocument._id);
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

Meteor.publish("questionSearch", function (params) {
    return QuestionHelpers.search(params, this.userId);
});

Meteor.publish("questions", function () {
    if (this.userId) {
        return Questions.find({},
        {
            fields: questionPrivateFields
        });
    }
});

Meteor.publish("question", function (questionId) {
    check(questionId, String);

    if (this.userId) {
        return Questions.find({ _id: questionId },
            {
                fields: questionPrivateFields
            });
    } else {
        return Questions.find(
        {
            _id: questionId,
            answer: { $exists: true },
            verifiedBy: { $exists: true },
            publishedBy: { $exists: true }
        },
        {
            fields: questionPublicFields
        });
    }
});

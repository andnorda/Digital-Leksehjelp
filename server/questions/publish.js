Meteor.publish("questionSearch", function (params) {
    return QuestionHelpers.search(params);
});

Meteor.publish("questions", function () {
    if (this.userId) {
        return Questions.find({});
    }
});

Meteor.publish("question", function (questionId) {
    check(questionId, String);

    if (this.userId) {
        return Questions.find({ _id: questionId });
    } else {
        return Questions.find({
            _id: questionId,
            answer: { $exists: true },
            verifiedBy: { $exists: true },
            publishedBy: { $exists: true }
        });
    }
});

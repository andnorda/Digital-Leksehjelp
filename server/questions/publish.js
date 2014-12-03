Meteor.publish("questionSearch", function (params) {
    var searchCritera = QuestionHelpers.parseSearchParams(params);

    searchCritera.selector.$and.push({ answer: { $exists: true }});

    if (!this.userId) {
        searchCritera.selector.$and.push(
            { verifiedBy: { $exists: true }},
            { publishedBy: { $exists: true }}
        )
    }

    return Questions.find(searchCritera.selector, searchCritera.options);
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

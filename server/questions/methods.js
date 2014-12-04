Meteor.methods({
    questionSearchCount: function (params) {
        return QuestionHelpers.search(params).count();
    },
    relatedQuestions: function (params) {
        params['limit'] = 10;
        return QuestionHelpers.search(params).fetch();
    }
});

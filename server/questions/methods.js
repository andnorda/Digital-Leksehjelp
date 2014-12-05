Meteor.methods({
    questionSearchCount: function (params) {
        return QuestionHelpers.search(params).count();
    },
    relatedQuestions: function (params) {
        params['limit'] = CONSTANTS.RELATED_QUESTION_SEARCH_LIMIT;
        return QuestionHelpers.search(params).fetch();
    }
});

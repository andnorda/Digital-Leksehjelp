Meteor.methods({
    questionSearchCount: function(params) {
        return QuestionHelpers.search(params, Meteor.userId()).count();
    },
    relatedQuestions: function(params) {
        params['limit'] = CONSTANTS.RELATED_QUESTION_SEARCH_LIMIT;
        params['related'] = true;
        return QuestionHelpers.search(params, Meteor.userId()).fetch();
    },
    verifiedQuestionCount: function() {
        return Questions.find({
            verifiedBy: { $exists: true }
        }).count();
    }
});

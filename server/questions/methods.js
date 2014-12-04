Meteor.methods({
    questionSearchCount: function (params) {
        return QuestionHelpers.search(params).count();
    }
});

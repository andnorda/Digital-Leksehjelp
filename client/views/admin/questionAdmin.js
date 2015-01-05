Template.verifiedQuestionsList.helpers({
    verifiedQuestions: function () {
        return Questions.find({
            verifiedBy: { $exists: true }
        }, {
            sort: { questionDate: -1 }
        });
    }
});

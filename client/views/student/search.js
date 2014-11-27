Template.search.helpers({
    questions: function() {
        return Questions.find({
            answer: { $exists: true },
            verifiedBy: { $exists: true },
            publishedBy: { $exists: true },
        });
    }
});

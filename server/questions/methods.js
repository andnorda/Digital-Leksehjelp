Meteor.methods({
    questionSearchCount: function (params) {
        var searchCritera = QuestionHelpers.parseSearchParams(params);

        searchCritera.selector.$and.push({ answer: { $exists: true }});

        if (!Meteor.userId()) {
            searchCritera.selector.$and.push(
                { verifiedBy: { $exists: true }},
                { publishedBy: { $exists: true }}
            )
        }

        return Questions.find(searchCritera.selector, searchCritera.options).count();
    }
});

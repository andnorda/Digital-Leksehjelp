Template.search.helpers({
    questions: function() {
        return Questions.find({});
    }
});

Template.question.helpers({
    dateFormatter: function(date) {
        return moment(date).fromNow();
    }
});

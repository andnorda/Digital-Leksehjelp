var lastSearchForRelatedQuestionsTimestamp = 0;

searchForRelatedQuestions = function(subject, question) {
    var now = new Date().getTime();
    if ((now - lastSearchForRelatedQuestionsTimestamp) < 1000) { return; }
    lastSearchForRelatedQuestionsTimestamp = now;

    var query = {};
    if (subject) {
        query['subject'] = subject.humanReadableId;
    }
    if (question.length > 3) {
        query['q'] = question;
    }

    if (Object.keys(query).length > 0) {
        Meteor.call('relatedQuestions', query, function (error, result) {
            console.dir(result)
            Session.set("relatedQuestions", result);
        });
    } else {
        Session.set("relatedQuestions", []);
    }
}

Template.relatedQuestions.helpers({
    relatedQuestions: function () {
        return Session.get("relatedQuestions") || [];
    }
});

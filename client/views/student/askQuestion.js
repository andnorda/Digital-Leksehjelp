var resetQuestionForm = function() {
    $("select[name=subject]").val("default");
    $("select[name=grade]").val("default");
    $("textarea[name=question]").val("");
    $("input[name=email]").val("");
}

var lastSearchForRelatedQuestionsTimestamp = 0;

var searchForRelatedQuestions = function(event, template) {
    if ((event.timeStamp - lastSearchForRelatedQuestionsTimestamp) < 1000) { return; }
    lastSearchForRelatedQuestionsTimestamp = event.timeStamp;

    var subjectId = template.find("select[name=subject]").value;
    var subject = Subjects.findOne({ _id: subjectId });
    var question = template.find("textarea[name=question]").value;

    var query = {};
    if (subject) {
        query['subject'] = subject.humanReadableId;
    }
    if (question.length > 3) {
        query['q'] = question;
    }

    if (Object.keys(query).length > 0) {
        Meteor.call('relatedQuestions', query, function (error, result) {
            Session.set("relatedQuestions", result);
        });
    } else {
        Session.set("relatedQuestions", []);
    }
}

Template.questionForm.events({
    'submit form' : function (e, template) {
        e.preventDefault();
        var subjectId = template.find("select[name=subject]").value;
        var grade = template.find("select[name=grade]").value;
        var question = template.find("textarea[name=question]").value;
        var studentEmail = template.find("input[name=email]").value;

        Meteor.call('askQuestion',
        {
            subjectId: subjectId,
            grade: grade,
            question: question,
            studentEmail: studentEmail
        },
        function (error) {
            if (error) {
                FlashMessages.sendError("Noe gikk galt ved innsending av spørsmål. Vennligst prøv igjen.", { autoHide: true, hideDelay: 6000 });
            } else {
                resetQuestionForm();
                FlashMessages.sendSuccess("Spørsmål sendt inn. Du vil få beskjed på e-post når spørsmålet er besvart.", { autoHide: true, hideDelay: 6000 });
            }
        });
    },
    'keydown, blur, focus textarea[name=question]' : function (event, template) {
        searchForRelatedQuestions(event, template);
    },
    'blur select[name=subject]' : function (event, template) {
        searchForRelatedQuestions(event, template);
    }
});

Template.relatedQuestions.helpers({
    relatedQuestions: function () {
        return Session.get("relatedQuestions");
    }
});

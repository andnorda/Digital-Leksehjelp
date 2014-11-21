Template.questionForm.helpers({
    subjects: function () {
        return Subjects.find({});
    },
    grades: function () {
        return GRADES;
    }
});

var resetQuestionForm = function() {
    var subjectId = $("select[name=subject]").val("default");
    var grade = $("select[name=grade]").val("default");
    var question = $("textarea[name=question]").val("");
    var email = $("input[name=email]").val("");
}

Template.questionForm.events({
    'submit form' : function (e, template) {
        e.preventDefault();
        var subjectId = template.find("select[name=subject]").value;
        var grade = template.find("select[name=grade]").value;
        var question = template.find("textarea[name=question]").value;
        var email = template.find("input[name=email]").value;

        // TODO: do validation

        Meteor.call('askQuestion',
        {
            subjectId: subjectId,
            grade: grade,
            question: question,
            email: email
        },
        function (error) {
            if (error) {
                FlashMessages.sendError("Noe gikk galt ved innsending av spørsmål. Vennligst prøv igjen.", { autoHide: true, hideDelay: 6000 });
            } else {
                resetQuestionForm();
                FlashMessages.sendSuccess("Spørsmål sendt inn. Du vil få beskjed på e-post når spørsmålet er besvart.", { autoHide: true, hideDelay: 6000 });
            }
        });
    }
});

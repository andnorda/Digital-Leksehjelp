var askQuestion = function (questionFields) {
    Meteor.call('askQuestion', questionFields,
        function (error) {
            if (error) {
                FlashMessages.sendError("Noe gikk galt ved innsending av spørsmål. Vennligst prøv igjen.", { autoHide: true, hideDelay: 6000 });
            } else {
                $("form[name=questionForm]")[0].reset();
                FlashMessages.sendSuccess("Spørsmål sendt inn. Du vil få beskjed på e-post når spørsmålet er besvart.", { autoHide: true, hideDelay: 6000 });
            }
            $("button[type=submit]").removeClass("disabled");
        });
}

Template.questionForm.events({
    'submit form' : function (e, template) {
        e.preventDefault();
        $("button[type=submit]").addClass("disabled");

        var questionFields = {
            subjectId: template.find("select[name=subject]").value,
            grade: template.find("select[name=grade]").value,
            question: template.find("textarea[name=question]").value,
            studentEmail: template.find("input[name=email]").value
        }

        var files = $("input[name=attachment]")[0].files;

        if (files.length === 1) {
            S3.upload(files, "/vedlegg", function(error, result){
                if (!result.uploading) {
                    questionFields['attachmentUrl'] = result.url;
                    askQuestion(questionFields);
                }
            });
        } else {
            askQuestion(questionFields);
        }
    },
    'keydown, blur, focus textarea[name=question]' : function (event, template) {
        var subjectId = template.find("select[name=subject]").value;
        var subject = Subjects.findOne({ _id: subjectId });
        var question = template.find("textarea[name=question]").value;

        searchForRelatedQuestions(subject, question);
    },
    'blur select[name=subject]' : function (event, template) {
        var subjectId = template.find("select[name=subject]").value;
        var subject = Subjects.findOne({ _id: subjectId });
        var question = template.find("textarea[name=question]").value;

        searchForRelatedQuestions(subject, question);
    },
    'change .btn-file :file' : function (event, template) {
        var input = $("input[name=attachment]");
        var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#inputFileslabel").val(label);
    },
    'click #inputFileslabel' : function () {
        $("input[name=attachment]").trigger('click');
    }
});

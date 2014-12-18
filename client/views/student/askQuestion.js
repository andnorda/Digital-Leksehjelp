var resetForm = function () {
    $("form[name=questionForm]")[0].reset();
    Session.set('attachmentLabel', undefined);
}

var askQuestion = function (questionFields) {
    Meteor.call('askQuestion', questionFields,
        function (error) {
            if (error) {
                FlashMessages.sendError("Noe gikk galt ved innsending av spørsmål. Vennligst prøv igjen.", { autoHide: true, hideDelay: 6000 });
            } else {
                resetForm();
                FlashMessages.sendSuccess("Spørsmål sendt inn. Du vil få beskjed på e-post når spørsmålet er besvart.", { autoHide: true, hideDelay: 6000 });
            }
            $("button[type=submit]").removeClass("disabled");
        });
};

var isEmail = function(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

Template.questionForm.helpers({
    percentUploaded: function () {
        var file = S3.collection.findOne({ uploading: true });
        if (file) {
            return file.percent_uploaded;
        }
    },
    attachmentLabel: function () {
        return Session.get("attachmentLabel");
    },
    attachmentSelected: function () {
        if (Session.get("attachmentLabel")) {
            return "hidden";
        }
    }
});

Template.questionForm.events({
    'submit form' : function (e, template) {
        e.preventDefault();
        $("button[type=submit]").addClass("disabled");

        var grade = $('#chosen-grade').text();
        grade = (grade == "Velg trinn") ? "default" : grade;

        var questionFields = {
            subjectId: $('#chosen-subject').attr('data-id'),
            grade: grade,
            question: template.find("textarea[name=question]").value,
            studentEmail: template.find("input[name=email]").value
        };

        validationError = [];
        validationErrorDep.changed();
        if (questionFields.subjectId === "default") {
            validationError.push("subjectError");
            validationErrorDep.changed();
        }
        if (questionFields.grade === "default") {
            validationError.push("gradeError");
            validationErrorDep.changed();
        }
        if(questionFields.question.trim() === ''){
            validationError.push("questionFieldError");
            validationErrorDep.changed();
        }
        if(!isEmail(questionFields.studentEmail)) {
            validationError.push("emailError");
            validationErrorDep.changed();
        }
        if(validationError.length > 0) {
            $("button[type=submit]").removeClass("disabled");
            return;
        }

        var files = $("input[name=attachment]")[0].files;

        if (files.length === 1) {
            if (files[0].size > CONSTANTS.S3_MAX_UPLOAD_FILE_SIZE) {
                FlashMessages.sendError("For stort vedlegg (maks 5 MB).", { autoHide: true, hideDelay: 6000 });
                $("button[type=submit]").removeClass("disabled");
                return;
            }

            S3.upload(files, "/vedlegg", function(error, result) {
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
        var subjectId = $('#chosen-subject').attr('data-id');
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
    'change .dl-file-chooser :file' : function (event, template) {
        var input = $("input[name=attachment]");
        var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        Session.set("attachmentLabel", label);
    },
    'click .remove-attachment' : function () {
        var fileInput = $("input[name=attachment]");
        fileInput.replaceWith(fileInput = fileInput.clone(true));
        Session.set('attachmentLabel', undefined);
    }
});

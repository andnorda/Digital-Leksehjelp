Template.answerQuestionForm.rendered = function() {
    var subject = Subjects.findOne({ _id: this.data.subjectId });
    searchForRelatedQuestions(subject, this.data.question);
    $('#answer').summernote({
        height: 300,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol']],
            ['insert', ['link', 'picture']],
            ['misc', ['fullscreen', 'undo', 'redo']]
        ]
    });
}

Template.answerQuestionForm.created = function () {
    Meteor.call('setEditing', {questionId: this.data._id, editing: true});
    window.onbeforeunload = function() {
        Meteor.call('setEditing', {questionId: this.data._id, editing: false});
    }.bind(this);
}

Template.answerQuestionForm.destroyed = function () {
    Meteor.call('setEditing', {questionId: this.data._id, editing: false});
}

Template.answerQuestionForm.helpers({
    publishIsChecked: function(question) {
        if (question.answer) {
            return question.publishedBy;
        }
        return false;
    },
    percentUploaded: function () {
        var file = S3.collection.findOne({ uploading: true });
        if (file) {
            return file.percent_uploaded;
        }
    },
    answerText: function (question) {
      if (question.answer) {
        return question.answer;
      } else {
        return "<br><br>Med vennlig hilsen,<br>Digital leksehjelp";
      }
    }
});

var answerQuestion = function (answerFields) {
    Meteor.call('answerQuestion', answerFields,
        function (error) {
            if (error) {
                FlashMessages.sendError(error.message);
            } else {
                FlashMessages.sendSuccess("Svar lagret", { autoHide: true, hideDelay: 6000 });
            }
        });
}

Template.answerQuestion.events({
    'click .ignore-changes-and-close-window' : function(event)  {
        event.preventDefault();

        Meteor.call('setEditing', {questionId: this._id, editing: false}, function () {
            window.close();
        });
    }
});

Template.answerQuestionForm.events({
    'submit form' : function(event, template)  {
        event.preventDefault();
        var answerFields = {
            questionId: template.data._id,
            question: template.find("textarea[name=question]").value,
            title: template.find("input[name=title]").value.substring(0, 120),
            answer: $('#answer').code(),
            publishAnswer: (template.find("input[name=publishAnswer]:checked")) ? true : false
        }

        var files = $("input[name=attachment]")[0].files;

        if (files.length === 1) {
            if (files[0].size > CONSTANTS.S3_MAX_UPLOAD_FILE_SIZE) {
                FlashMessages.sendError("For stor fil. Maks 5 MB.");
                return;
            }

            S3.upload(files, "/vedlegg", function(error, result) {
                if (error) {
                    FlashMessages.sendError("Noe gikk galt ved opplastningen. Prøv igjen.\n" + error.message);
                    return;
                }
                if (!result.uploading) {
                    answerFields['answerAttachmentUrl'] = result.url;
                    answerQuestion(answerFields);
                }
            });
        } else {
            answerQuestion(answerFields);
        }


    },
    'click #setTitleButton' : function (event, template) {
        var question = template.find("textarea[name=question]").value;
        $("input[name=title]").val(question.substring(0, 120));
    }
});


Template.answerQuestionForm.rendered = function() {
    var subject = Subjects.findOne({ _id: this.data.subjectId });
    searchForRelatedQuestions(subject, this.data.question);
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
        return !question.answer || question.publishedBy;
    }
});

Template.answerQuestionForm.events({
    'submit form' : function(event, template)  {
        event.preventDefault();
        var questionId = template.data._id;
        var question = template.find("textarea[name=question]").value;
        var title = template.find("input[name=title]").value.substring(0, 120);
        var answer = template.find("textarea[name=answer]").value;
        var publishAnswer = (template.find("input[name=publishAnswer]:checked")) ? true : false;

        Meteor.call('answerQuestion',
        {
            questionId: questionId,
            question: question,
            title: title,
            answer: answer,
            publishAnswer: publishAnswer
        },
        function (error) {
            if (error) {
                FlashMessages.sendError(error.message);
            } else {
                FlashMessages.sendSuccess("Svar lagret", { autoHide: true, hideDelay: 6000 });
            }
        });
    },
    'click #setTitleButton' : function (event, template) {
        var question = template.find("textarea[name=question]").value;
        $("input[name=title]").val(question.substring(0, 120));
    }
});

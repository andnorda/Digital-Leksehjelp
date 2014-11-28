Template.answerQuestionForm.events({
    'submit form' : function(event, template)  {
        event.preventDefault();
        var questionId = template.data._id;
        var title = template.find("input[name=title]").value;
        var answer = template.find("textarea[name=answer]").value;
        var publishAnswer = (template.find("input[name=publishAnswer]:checked")) ? true : false;

        Meteor.call('answerQuestion',
        {
            questionId: questionId,
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
    }
});

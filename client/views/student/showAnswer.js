Template.showAnswer.rendered = function() {
    window.scrollTo(0, 0);
}

Template.showAnswer.helpers({
    questionContext: function() {
        return Questions.findOne({});
    },
    showNonpublicQuestionWarning: function () {
        if (Meteor.user() && this.question) {
            return !this.publishedBy || !this.verifiedBy;
        }
    }
});

Template.showAnswer.events({
    'click .verify-answer': function(event, template) {
        if (Meteor.user()) {
            Meteor.call('verifyAnswer',
            {
                questionId: this._id
            },
            function (error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            });
        }
    }
});

Template.volunteerMiniForm.helpers({
    canBeVerified: function() {
        if (Meteor.user() && this.question) {
            return !this.verifiedBy;
        }
        return false;
    },
    publishIsChecked: function() {
        if (this.answer) {
            return this.publishedBy;
        }
        return false;
    }
});

Template.volunteerMiniForm.events({
    'click button#updateQuestion': function(event, template) {
        if (Meteor.user()) {


        }
    }
});

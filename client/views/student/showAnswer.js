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

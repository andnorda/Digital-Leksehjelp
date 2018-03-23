import { Questions } from '/imports/api/questions/questions.js';

import './showAnswer.html';

Template.showAnswer.rendered = function() {
    window.scrollTo(0, 0);
};

Template.showAnswer.helpers({
    questionContext: function() {
        return Questions.findOne({});
    },
    showNonpublicQuestionWarning: function() {
        if (Meteor.user() && this.question) {
            return !this.publishedBy || !this.verifiedBy;
        }
    },
    showVolunteerMiniForm: function() {
        if (Meteor.user() && this.question) {
            return !this.verifiedBy;
        }

        return false;
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
        event.preventDefault();

        var questionId = template.data._id;
        var title = template.find('input[name=title]').value.substring(0, 120);
        var publishAnswer = template.find('input[name=publishAnswer]:checked')
            ? true
            : false;

        if (Meteor.user()) {
            Meteor.call(
                'updateQuestionFromVolunteerMiniForm',
                {
                    questionId: questionId,
                    title: title,
                    publishAnswer: publishAnswer
                },
                function(error) {
                    if (error) {
                        FlashMessages.sendError(error.message);
                    } else {
                        FlashMessages.sendSuccess('Svar lagret', {
                            autoHide: true,
                            hideDelay: 6000
                        });
                    }
                }
            );
        }
    },

    'click .verify-answer': function(event, template) {
        event.preventDefault();

        if (Meteor.user()) {
            Meteor.call(
                'verifyAnswer',
                {
                    questionId: this._id
                },
                function(error) {
                    if (error) {
                        FlashMessages.sendError(error.message);
                    }
                }
            );
        }
    }
});

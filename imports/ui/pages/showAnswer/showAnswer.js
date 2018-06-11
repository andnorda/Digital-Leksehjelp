import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Questions } from '/imports/api/questions/questions.js';
import { Subjects } from '/imports/api/subjects/subjects.js';

import './showAnswer.html';

Template.showAnswer.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.showAnswer.onRendered(function() {
    window.scrollTo(0, 0);
});

Template.showAnswer.helpers({
    subjectName(subjectId) {
        const subject = Subjects.findOne({ _id: subjectId });
        return subject ? subject.name : 'Ukjent fag';
    },
    questionContext() {
        return Questions.findOne({});
    },
    showNonpublicQuestionWarning() {
        if (Meteor.user() && this.question) {
            return !this.publishedBy || !this.verifiedBy;
        }
        return false;
    },
    showVolunteerMiniForm() {
        if (Meteor.user() && this.question) {
            return !this.verifiedBy;
        }

        return false;
    }
});

Template.volunteerMiniForm.helpers({
    canBeVerified() {
        if (Meteor.user() && this.question) {
            return !this.verifiedBy;
        }
        return false;
    },
    publishIsChecked() {
        if (this.answer) {
            return this.publishedBy;
        }
        return false;
    }
});

Template.volunteerMiniForm.events({
    'click button#updateQuestion'(event, templateInstance) {
        event.preventDefault();

        const questionId = templateInstance.data._id;
        const title = templateInstance
            .find('input[name=title]')
            .value.substring(0, 120);
        const publishAnswer = !!templateInstance.find(
            'input[name=publishAnswer]:checked'
        );

        if (Meteor.user()) {
            Meteor.call('questions.updateFromVolunteerMiniForm', {
                questionId,
                title,
                publishAnswer
            });
        }
    },

    'click .verify-answer'(event) {
        event.preventDefault();

        if (Meteor.user()) {
            Meteor.call('questions.verify', {
                questionId: this._id
            });
        }
    }
});

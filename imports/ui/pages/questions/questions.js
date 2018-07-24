import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { format } from 'date-fns';
import { Questions } from '/imports/api/questions/questions.js';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { Feedback } from '/imports/api/feedback/feedback.js';
import { QUESTION_SUBSCRIPTION_LEVEL } from '/imports/constants';

import '../../components/tagList/tagList.js';
import '../../components/dropdownMenu/dropdownMenu.js';

import './questions.html';
import './questions.less';

Template.questions.onCreated(function questionsOnCreated() {
    this.autorun(() => {
        this.subscribe('users');
        this.subscribe('questions', QUESTION_SUBSCRIPTION_LEVEL.REGULAR);
        this.subscribe('subjects');
        this.subscribe('feedback');
    });
});

Template.questions.helpers({
    inbox() {
        return Questions.find(
            { answer: { $exists: false } },
            { sort: { questionDate: 1 } }
        );
    },
    edited() {
        return Questions.find(
            {
                answer: { $exists: true },
                submittedForApprovalBy: { $exists: false },
                approvedBy: { $exists: false },
                publishedBy: { $exists: false }
            },
            { sort: { questionDate: 1 } }
        );
    },
    forApproval() {
        return Questions.find(
            {
                answer: { $exists: true },
                submittedForApprovalBy: { $exists: true },
                approvedBy: { $exists: false },
                publishedBy: { $exists: false }
            },
            { sort: { questionDate: 1 } }
        );
    },
    feedbackList() {
        return Feedback.find({}, { sort: { createdAt: 1 } });
    }
});

Template.questionListItem.helpers({
    link() {
        return `/frivillig/sporsmal/svar/${this.question._id}`;
    },
    prettyDate() {
        return format(this.question.questionDate, 'DD.MM.YY kl. HH:mm');
    },
    menuItems() {
        const id = this.question._id;
        return [
            {
                label: 'Slett spørsmål',
                onClick: () => {
                    if (
                        confirm('Er du sikker på at du vil slette spørsmålet?')
                    ) {
                        Meteor.call('questions.delete', id);
                    }
                }
            }
        ];
    },
    isEditing() {
        return this.question.editing && this.question.editing.length > 0;
    },
    editingName() {
        return Meteor.users.findOne(this.question.editing[0]).profile.firstName;
    }
});

Template.feedbackListItem.onCreated(function() {
    this.autorun(() => {
        this.subscribe(
            'questions.bySlugOrId',
            Template.currentData().feedback.questionId
        );
    });
});

Template.feedbackListItem.helpers({
    link() {
        return `/frivillig/sporsmal/svar/${this.feedback.questionId}`;
    },
    question() {
        return Questions.findOne(this.feedback.questionId);
    }
});

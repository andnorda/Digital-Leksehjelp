import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { ReactiveDict } from 'meteor/reactive-dict';
import { format } from 'date-fns';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { Feedback } from '/imports/api/feedback/feedback.js';
import { CONSTANTS } from '/imports/constants.js';

import './answerQuestion.html';
import './answerQuestion.less';

import '../../components/topicsInput/topicsInput.js';
import '../../components/button/button.js';
import '../../components/questionStatus/questionStatus.js';

Template.answerQuestion.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
        this.subscribe(
            'feedback.byQuestionId',
            Router.current().params.questionId
        );
    });
});

Template.answerQuestion.helpers({
    prettyDate() {
        return format(this.questionDate, 'DD.MM.YY kl. HH:mm');
    },
    editDate() {
        return format(this.date, 'DD.MM.YY kl. HH:mm');
    },
    feedbackDate() {
        return format(this.createdAt, 'DD.MM.YY kl. HH:mm');
    },
    name() {
        const user = Meteor.users.findOne(this.id);
        return user && user.profile.firstName;
    },
    feedbackList() {
        return Feedback.find({ questionId: this._id });
    },
    deleteFeedback() {
        const id = this._id;
        return () => {
            if (confirm('Er du sikker på at du vil slette tilbakemeldingen?')) {
                Meteor.call('feedback.delete', id);
            }
        };
    }
});

Template.answerQuestionForm.onRendered(function() {
    $('#answer').summernote({
        height: 300,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol']],
            ['insert', ['link', 'picture']],
            ['misc', ['fullscreen', 'undo', 'redo']]
        ]
    });
});

Template.answerQuestionForm.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('topics', this.data.topics);
    this.state.set('answerAttachments', this.data.answerAttachments);
});

Template.answerQuestionForm.helpers({
    subjectName(subjectId) {
        const subject = Subjects.findOne({ _id: subjectId });
        return subject ? subject.name : 'Ukjent fag';
    },
    publishIsChecked(question) {
        if (question.answer) {
            return question.publishedBy;
        }
        return false;
    },
    percentUploaded() {
        const file = S3.collection.findOne({ uploading: true });
        return file && file.percent_uploaded;
    },
    answerText() {
        return (
            this.answer || '<br><br>Med vennlig hilsen,<br>Digital leksehjelp'
        );
    },
    topics() {
        return Template.instance().state.get('topics');
    },
    addTopic() {
        const state = Template.instance().state;
        return topic =>
            state.set('topics', (state.get('topics') || []).concat(topic));
    },
    removeTopic() {
        const state = Template.instance().state;
        return topic =>
            state.set(
                'topics',
                (state.get('topics') || []).filter(t => t !== topic)
            );
    },
    answerAttachments() {
        return Template.instance().state.get('answerAttachments');
    }
});

Template.answerQuestionForm.events({
    'click button.upload'(event) {
        event.preventDefault();
        setTimeout(() => $('input.file').click(), 0);
    },
    'change .file'(event) {
        const { files } = event.target;
        const state = Template.instance().state;

        S3.upload({ files, path: 'attachments' }, function(error, result) {
            if (error) {
                // TODO
            } else {
                state.set(
                    'answerAttachments',
                    (state.get('answerAttachments') || []).concat({
                        name: result.file.original_name,
                        url: result.secure_url,
                        id: result._id
                    })
                );
            }
        });
    },
    'click .removeAttachment'() {
        const state = Template.instance().state;
        state.set(
            'answerAttachments',
            state
                .get('answerAttachments')
                .filter(attachment => attachment.id !== this.id)
        );
    },
    'input .title'(event) {
        Template.instance().state.set('title', event.target.value);
    },
    'input .question'(event) {
        Template.instance().state.set('question', event.target.value);
    },
    'input .answer'(event) {
        Template.instance().state.set('answer', event.target.value);
    },
    'submit form'(event, templateInstance) {
        event.preventDefault();

        const state = Template.instance().state;

        Meteor.call('questions.update', {
            id: this._id,
            title:
                state.get('title') !== undefined
                    ? state.get('title')
                    : this.title || '',
            topics: state.get('topics'),
            question: state.get('question') || this.question,
            answer: $('#answer').summernote('code'),
            answerAttachments: state.get('answerAttachments')
        });
    }
});

Template.answerQuestionButtons.helpers({
    published() {
        return this.publishedBy;
    },
    approved() {
        return !this.publishedBy && this.approvedBy;
    },
    forApproval() {
        return !this.approvedBy && this.submittedForApprovalBy;
    },
    edited() {
        return (
            !this.submittedForApprovalBy &&
            this.editedBy &&
            this.editedBy.length
        );
    },

    unpublish() {
        const id = this._id;
        return () => {
            if (
                confirm(
                    'Er du sikker på at du vil sjule svaret på nettsiden? Elever vil da ikke lenger kunne se spørsmålet eller svaret.'
                )
            ) {
                Meteor.call('questions.unpublish', id);
            }
        };
    },
    publish() {
        const id = this._id;
        return () => {
            if (
                confirm(
                    'Er du sikker på at du vil publisere svaret på nettsiden? Det vil da bli offentlig tilgjengelig for alle.'
                )
            ) {
                Meteor.call('questions.publish', id);
            }
        };
    },
    approve() {
        const id = this._id;
        return () => {
            if (
                confirm(
                    'Er du sikker på at du vil godkjenne svaret? En epost med svaret vil da bli sendt til eleven.'
                )
            ) {
                Meteor.call('questions.approve', id);
            }
        };
    },
    approveAndPublish() {
        const id = this._id;
        return () => {
            if (
                confirm(
                    'Er du sikker på at du vil godkjenne og publisere svaret? En epost med svaret vil da bli sendt til eleven, og svaret vil bli offentlig tilgjengelig for alle.'
                )
            ) {
                Meteor.call('questions.approve', id, { publish: true });
            }
        };
    },
    submitForApproval() {
        const id = this._id;
        return () => Meteor.call('questions.submitForApproval', id);
    }
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { CONSTANTS } from '/imports/constants.js';

import './answerQuestion.html';

Template.answerQuestionForm.onRendered(function() {
    const subject = Subjects.findOne({ _id: this.data.subjectId });
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
});

Template.answerQuestionForm.onCreated(function() {
    Meteor.call('questions.setEditing', {
        questionId: this.data._id,
        editing: true
    });
    window.onbeforeunload = function() {
        Meteor.call('questions.setEditing', {
            questionId: this.data._id,
            editing: false
        });
    }.bind(this);
});

Template.answerQuestionForm.onDestroyed(function() {
    Meteor.call('questions.setEditing', {
        questionId: this.data._id,
        editing: false
    });
});

Template.answerQuestionForm.helpers({
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
    answerText(question) {
        if (question.answer) {
            return question.answer;
        }
        return '<br><br>Med vennlig hilsen,<br>Digital leksehjelp';
    }
});

const answerQuestion = function(answerFields) {
    Meteor.call('questions.answer', answerFields, function(error) {
        if (error) {
            // TODO
        }
    });
};

Template.answerQuestion.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.answerQuestion.events({
    'click .ignore-changes-and-close-window'(event) {
        event.preventDefault();

        Meteor.call(
            'questions.setEditing',
            { questionId: this._id, editing: false },
            function() {
                window.close();
            }
        );
    }
});

Template.answerQuestionForm.events({
    'submit form'(event, templateInstance) {
        event.preventDefault();
        const answerFields = {
            questionId: templateInstance.data._id,
            question: templateInstance.find('textarea[name=question]').value,
            title: templateInstance
                .find('input[name=title]')
                .value.substring(0, 120),
            answer: $('#answer').summernote('code'),
            publishAnswer: !!templateInstance.find(
                'input[name=publishAnswer]:checked'
            )
        };

        const { files } = $('input[name=attachment]')[0];

        if (files.length === 1) {
            if (files[0].size > CONSTANTS.S3_MAX_UPLOAD_FILE_SIZE) {
                // TODO
                return;
            }

            S3.upload({ files, path: 'vedlegg' }, function(error, result) {
                if (error) {
                    // TODO
                    return;
                }
                if (!result.uploading) {
                    answerFields.answerAttachmentUrl = result.url;
                    answerQuestion(answerFields);
                }
            });
        } else {
            answerQuestion(answerFields);
        }
    },
    'click #setTitleButton'(event, templateInstance) {
        const question = templateInstance.find('textarea[name=question]').value;
        $('input[name=title]').val(question.substring(0, 120));
    }
});

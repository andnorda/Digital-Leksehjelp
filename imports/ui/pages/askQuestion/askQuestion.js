import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { CONSTANTS } from '/imports/constants.js';

import './askQuestion.html';

import '../../components/subjectSelector/subjectSelector.js';
import '../../components/gradeSelector/gradeSelector.js';
import '../../components/relatedQuestions/relatedQuestions.js';

const resetForm = function() {
    $('form[name=questionForm]')[0].reset();
    Session.set('attachmentLabel', undefined);
    $('#chosen-grade').text('Velg trinn');
    $('#chosen-subject').attr('data-id', 'default');
    $('#chosen-subject').text('Velg fag');
};

const askQuestion = function(questionFields) {
    Meteor.call('questions.ask', questionFields, function(error) {
        if (error) {
            FlashMessages.sendError(
                'Noe gikk galt ved innsending av spørsmål. Vennligst prøv igjen.',
                { autoHide: true, hideDelay: 6000 }
            );
        } else {
            resetForm();
            FlashMessages.sendSuccess(
                'Spørsmål sendt inn. Du vil få beskjed på e-post når spørsmålet er besvart.'
            );
        }
        $('button[type=submit]').removeClass('disabled');
    });
};

Template.questionForm.onRendered(function() {
    Session.set('attachmentLabel', undefined);
});

Template.questionForm.helpers({
    percentUploaded() {
        const file = S3.collection.findOne({ uploading: true });
        return file && file.percent_uploaded;
    },
    attachmentLabel() {
        return Session.get('attachmentLabel');
    },
    attachmentSelected() {
        return Session.get('attachmentLabel') ? 'hidden' : '';
    }
});

Template.questionForm.events({
    'submit form'(event, templateInstance) {
        event.preventDefault();

        $('button[type=submit]').addClass('disabled');

        let grade = $('#chosen-grade').text();
        grade = grade === 'Velg trinn' ? 'default' : grade;

        const questionFields = {
            subjectId: $('#chosen-subject').attr('data-id'),
            grade,
            question: templateInstance.find('textarea[name=question]').value,
            studentEmail: templateInstance.find('input[name=email]').value
        };

        validationError = [];
        validationErrorDep.changed();
        if (questionFields.subjectId === 'default') {
            validationError.push('subjectError');
            validationErrorDep.changed();
        }
        if (questionFields.grade === 'default') {
            validationError.push('gradeError');
            validationErrorDep.changed();
        }
        if (questionFields.question.trim() === '') {
            validationError.push('questionFieldError');
            validationErrorDep.changed();
        }
        if (!SimpleSchema.RegEx.Email.test(questionFields.studentEmail)) {
            validationError.push('emailError');
            validationErrorDep.changed();
        }
        if (validationError.length > 0) {
            $('button[type=submit]').removeClass('disabled');
            return;
        }

        const { files } = $('input[name=attachment]')[0];

        if (files.length === 1) {
            if (files[0].size > CONSTANTS.S3_MAX_UPLOAD_FILE_SIZE) {
                validationError.push('attachmentError');
                validationErrorDep.changed();
                $('#attachment-error').removeClass('hidden');
                setTimeout(function() {
                    $('#attachment-error').addClass('hidden');
                }, 5000);
                $('button[type=submit]').removeClass('disabled');
                return;
            }

            S3.upload(files, '/vedlegg', function(error, result) {
                if (error) {
                    $('#attachment-error').removeClass('hidden');
                    $('#attachment-error').text(
                        'Det skjedde noe galt med opplastningen. Prøv igjen'
                    );
                    setTimeout(function() {
                        $('#attachment-error').addClass('hidden');
                        $('#attachment-error').html(
                            'Vedlegget du har valgt er for stort (maks 5 <a href="http://no.wikipedia.org/wiki/Megabyte">MB</a>)'
                        );
                    }, 5000);
                    validationError.push('attachmentError');
                    validationErrorDep.changed();
                    return;
                }
                if (!result.uploading) {
                    questionFields.attachmentUrl = result.url;
                    askQuestion(questionFields);
                }
            });
        } else {
            askQuestion(questionFields);
        }
    },
    'keydown, blur, focus textarea[name=question]'(event, templateInstance) {
        const subjectId = $('#chosen-subject').attr('data-id');
        const subject = Subjects.findOne({ _id: subjectId });
        const question = templateInstance.find('textarea[name=question]').value;

        searchForRelatedQuestions(subject, question);
    },
    'blur select[name=subject]'(event, templateInstance) {
        const subjectId = templateInstance.find('select[name=subject]').value;
        const subject = Subjects.findOne({ _id: subjectId });
        const question = templateInstance.find('textarea[name=question]').value;

        searchForRelatedQuestions(subject, question);
    },
    'change .dl-file-chooser :file'() {
        const input = $('input[name=attachment]');
        const label = input
            .val()
            .replace(/\\/g, '/')
            .replace(/.*\//, '');
        Session.set('attachmentLabel', label);
    },
    'click .remove-attachment'() {
        let fileInput = $('input[name=attachment]');
        fileInput.replaceWith((fileInput = fileInput.clone(true)));
        Session.set('attachmentLabel', undefined);
    }
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { CONSTANTS } from '/imports/constants.js';

import './askQuestion.html';
import './askQuestion.less';

import '../../components/subjectSelector/subjectSelector.js';
import '../../components/topicsInput/topicsInput.js';
import '../../components/select/select.js';
import '../../components/button/button.js';
import '../../components/relatedQuestions/relatedQuestions.js';

Template.askQuestion.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.askQuestion.helpers({
    subject() {
        return Template.instance().state.get('subject');
    },
    onSubjectChange() {
        const state = Template.instance().state;
        return subject => {
            if (subject !== state.get('subject')) {
                state.set('subject', subject);
                state.set('topics', []);
            }
        };
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
    grade() {
        return Template.instance().state.get('grade');
    },
    setGrade() {
        const state = Template.instance().state;
        return grade => state.set('grade', grade);
    },
    attachments() {
        return Template.instance().state.get('attachments');
    },
    question() {
        return Template.instance().state.get('question');
    },
    subjectValidationError() {
        return Template.instance().state.get('subjectValidationError');
    },
    gradeValidationError() {
        return Template.instance().state.get('gradeValidationError');
    },
    questionValidationError() {
        return Template.instance().state.get('questionValidationError');
    },
    emailValidationError() {
        return Template.instance().state.get('emailValidationError');
    },
    success() {
        return Template.instance().state.get('success');
    }
});

Template.askQuestion.events({
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
                    'attachments',
                    (state.get('attachments') || []).concat({
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
            'attachments',
            state
                .get('attachments')
                .filter(attachment => attachment.id !== this.id)
        );
    },
    'input .question'(event) {
        Template.instance().state.set('question', event.target.value);
    },
    'input .email'(event) {
        Template.instance().state.set('studentEmail', event.target.value);
    },
    'input .allowPublish'(event) {
        Template.instance().state.set('allowPublish', event.target.checked);
    },
    'submit form'(event) {
        event.preventDefault();

        const state = Template.instance().state;
        const subject = state.get('subject');
        const grade = state.get('grade');
        const question = state.get('question');
        const studentEmail = state.get('studentEmail');

        let error = false;
        if (!subject) {
            state.set('subjectValidationError', true);
            error = true;
        }
        if (!grade) {
            state.set('gradeValidationError', true);
            error = true;
        }
        if (!question) {
            state.set('questionValidationError', true);
            error = true;
        }
        if (!studentEmail) {
            state.set('emailValidationError', true);
            error = true;
        }

        if (!error) {
            Meteor.call(
                'questions.ask',
                {
                    subject,
                    topics: state.get('topics'),
                    grade,
                    question,
                    attachments: state.get('attachments'),
                    studentEmail,
                    allowPublish: state.get('allowPublish')
                },
                err => {
                    if (!err) {
                        state.set('success', true);
                    }
                }
            );
        }
    }
});

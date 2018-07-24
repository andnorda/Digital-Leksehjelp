import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { format } from 'date-fns';
import '../../components/button/button.js';

import './showAnswer.html';
import './showAnswer.less';

Template.showAnswer.helpers({
    prettyDate() {
        return format(this.questionDate, 'DD.MM.YYYY');
    }
});

Template.feedback.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.feedback.helpers({
    feedbackFormDisabled() {
        return !Template.instance().state.get('feedback');
    },
    success() {
        return Template.instance().state.get('success');
    }
});

Template.feedback.events({
    'input textarea'(event) {
        Template.instance().state.set('feedback', event.target.value);
    },
    'submit .feedbackForm'(event) {
        event.preventDefault();

        const state = Template.instance().state;

        Meteor.call(
            'feedback.send',
            { feedback: state.get('feedback'), questionId: this._id },
            err => {
                if (!err) {
                    state.set('success', true);
                }
            }
        );
    }
});

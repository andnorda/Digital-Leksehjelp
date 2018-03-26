import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Questions } from '/imports/api/questions/questions.js';

import './questionAdmin.html';

Template.verifiedQuestionsList.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('requestedQuestions', 20);

    this.autorun(() => {
        this.subscribe('users');
        this.subscribe('questions.verifiedCount');
        this.subscribe(
            'questions.verified',
            this.state.get('requestedQuestions')
        );
    });
});

Template.verifiedQuestionsList.helpers({
    username(userId) {
        const user = Meteor.users.findOne(userId);
        return user ? user.username : '';
    },
    verifiedQuestions() {
        return Questions.find(
            { verifiedBy: { $exists: true } },
            { sort: { questionDate: -1 } }
        );
    },
    hasMoreQuestions() {
        return (
            Questions.find({ verifiedBy: { $exists: true } }).count() <
            Counts.get('questions.verifiedCount')
        );
    }
});

Template.verifiedQuestionsList.events({
    'click .load-more'(event) {
        event.preventDefault();

        const { state } = Template.instance();
        state.set('requestedQuestions', state.get('requestedQuestions') + 20);
    }
});

import { Questions } from '/imports/api/questions/questions.js';

import './questionAdmin.html';

Template.verifiedQuestionsList.onCreated(
    function verifiedQuestionsListOnCreated() {
        this.autorun(() => {
            this.subscribe('users');
        });

        const state = new ReactiveDict();
        this.state = state;
        state.set('page', 0);

        Meteor.call('questions.verifiedCount', function(error, result) {
            state.set('verifiedQuestionCount', result);
        });
    }
);

Template.verifiedQuestionsList.helpers({
    username: function(userId) {
        var user = Meteor.users.findOne(userId);
        return user ? user.username : '';
    },
    verifiedQuestions: function() {
        return Questions.find(
            {
                verifiedBy: { $exists: true }
            },
            {
                sort: { questionDate: -1 }
            }
        );
    },
    hasMoreQuestions: function() {
        const state = Template.instance().state;
        const verifiedQuestionCount = state.get('verifiedQuestionCount');

        return (
            Questions.find({ verifiedBy: { $exists: true } }).count() <
            verifiedQuestionCount
        );
    }
});

Template.verifiedQuestionsList.events({
    'click .load-more': function(e) {
        e.preventDefault();
        const state = Template.instance().state;
        const page = state.get('page');
        state.set('page', page + 1);

        return Meteor.subscribe('questions.verified', page + 1);
    }
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { format, isBefore } from 'date-fns';
import { Questions } from '/imports/api/questions/questions.js';
import { Subjects } from '/imports/api/subjects/subjects.js';
import '../../components/button/button.js';

import './questionAdmin.html';
import './questionAdmin.less';

const pageSize = 20;

Template.publishedQuestions.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('requestedQuestions', pageSize);

    this.autorun(() => {
        this.subscribe('questions.verifiedPublishedCount');
        this.subscribe(
            'questions.verifiedPublished',
            this.state.get('requestedQuestions')
        );
    });
});

Template.publishedQuestions.helpers({
    questions() {
        return Questions.find(
            {
                approvedBy: { $exists: true },
                publishedBy: { $exists: true }
            },
            { sort: { questionDate: -1 } }
        );
    },
    hasMoreQuestions() {
        return (
            Questions.find({
                approvedBy: { $exists: true },
                publishedBy: { $exists: true }
            }).count() < Counts.get('questions.verifiedPublishedCount')
        );
    },
    loadMore() {
        const { state } = Template.instance();
        return () =>
            state.set(
                'requestedQuestions',
                state.get('requestedQuestions') + pageSize
            );
    }
});

Template.unpublishedQuestions.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('requestedQuestions', pageSize);

    this.autorun(() => {
        this.subscribe('questions.verifiedUnpublishedCount');
        this.subscribe(
            'questions.verifiedUnpublished',
            this.state.get('requestedQuestions')
        );
    });
});

Template.unpublishedQuestions.helpers({
    questions() {
        return Questions.find(
            {
                approvedBy: { $exists: true },
                publishedBy: { $exists: false }
            },
            { sort: { questionDate: -1 } }
        );
    },
    hasMoreQuestions() {
        return (
            Questions.find({
                approvedBy: { $exists: true },
                publishedBy: { $exists: false }
            }).count() < Counts.get('questions.verifiedUnpublishedCount')
        );
    },
    loadMore() {
        const { state } = Template.instance();
        return () =>
            state.set(
                'requestedQuestions',
                state.get('requestedQuestions') + pageSize
            );
    }
});

Template.question.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
        this.subscribe('users');
    });
});

const lastUpdate = editedBy =>
    editedBy.sort((a, b) => (isBefore(a.date, b.date) ? 1 : -1))[0] || {};

Template.question.helpers({
    title() {
        return this.title || '(ingen tittel)';
    },
    lastUpdatedBy() {
        const user = Meteor.users.findOne(lastUpdate(this.editedBy).id);
        return user && user.profile.firstName;
    },
    questionDate() {
        return format(this.questionDate, 'DD.MM.YY kl. HH:mm');
    },
    lastUpdatedDate() {
        return format(lastUpdate(this.editedBy).date, 'DD.MM.YY kl. HH:mm');
    },
    showLink() {
        return `/sporsmal/${this._id}`;
    },
    editLink() {
        return `/frivillig/sporsmal/svar/${this._id}`;
    }
});

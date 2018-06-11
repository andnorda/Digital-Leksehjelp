import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';
import { Questions } from '/imports/api/questions/questions.js';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { QUESTION_SUBSCRIPTION_LEVEL } from '/imports/constants';

import './questions.html';

Template.questions.onCreated(function questionsOnCreated() {
    this.autorun(() => {
        this.subscribe('users');
        this.subscribe('questions', QUESTION_SUBSCRIPTION_LEVEL.REGULAR);
        this.subscribe('subjects');
    });
});

const subjectIds = function(user) {
    if (!user || !user.subjects) {
        return [];
    }

    return user.subjects
        .map(subject => Subjects.findOne({ name: subject }))
        .filter(s => s)
        .map(subject => subject._id);
};

Template.unansweredQuestions.helpers({
    myUnansweredQuestions() {
        const mySubjectIds = subjectIds(Meteor.user());

        return Questions.find(
            {
                $and: [
                    { answer: { $exists: false } },
                    { subjectId: { $in: mySubjectIds } }
                ]
            },
            {
                sort: { questionDate: 1 }
            }
        );
    },
    otherUnansweredQuestions() {
        const mySubjectIds = subjectIds(Meteor.user());

        return Questions.find(
            {
                $and: [
                    { answer: { $exists: false } },
                    { subjectId: { $nin: mySubjectIds } }
                ]
            },
            {
                sort: { questionDate: 1 }
            }
        );
    }
});

Template.unansweredQuestionRow.helpers({
    status() {
        try {
            if (!this.editing || this.editing.length === 0) {
                return new Spacebars.SafeString('<td>Ubesvart</td>');
            }
            const usersEditing = this.editing
                .map(function(userId) {
                    const user = Meteor.users.findOne({ _id: userId });
                    if (user && user.profile && user.profile.firstName) {
                        return user.profile.firstName;
                    }
                    return 'ukjent bruker';
                })
                .join(', ');

            return new Spacebars.SafeString(
                `<td class='warning'>Redigeres av ${usersEditing}</td>`
            );
        } catch (error) {
            return new Spacebars.SafeString('<td>Ubesvart</td>');
        }
    }
});

Template.unverifiedQuestions.helpers({
    myApprovableQuestions() {
        return Questions.find(
            {
                $and: [
                    { answer: { $exists: true } },
                    { lastUpdatedBy: { $exists: true } },
                    { lastUpdatedBy: { $ne: Meteor.userId() } },
                    { verifiedBy: { $exists: false } }
                ]
            },
            {
                sort: { lastUpdatedDate: 1 }
            }
        );
    },
    otherApprovableQuestions() {
        return Questions.find(
            {
                $and: [
                    { answer: { $exists: true } },
                    { lastUpdatedBy: { $exists: true } },
                    { lastUpdatedBy: Meteor.userId() },
                    { verifiedBy: { $exists: false } }
                ]
            },
            {
                sort: { lastUpdatedDate: 1 }
            }
        );
    }
});

Template.answeredQuestionRow.events({
    'click .verify-answer'() {
        Meteor.call('questions.verify', {
            questionId: this._id
        });
    }
});

Template.answeredQuestionRow.helpers({
    username(userId) {
        const user = Meteor.users.findOne(userId);
        return user ? user.username : '';
    },
    status() {
        if (!this.editing || this.editing.length === 0) {
            return new Spacebars.SafeString('<td>Ubesvart</td>');
        }
        const usersEditing = this.editing
            .map(function(userId) {
                const user = Meteor.users.findOne({ _id: userId });
                if (user && user.profile && user.profile.firstName) {
                    return user.profile.firstName;
                }
                return 'ukjent bruker';
            })
            .join(', ');

        return new Spacebars.SafeString(
            `<td class='warning'>Redigeres av ${usersEditing}</td>`
        );
    }
});

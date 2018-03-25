import { Questions } from '/imports/api/questions/questions.js';

import './questions.html';

var subjectIds = function(user) {
    if (!user) {
        return [];
    }

    return user.profile.subjects.map(function(subject) {
        return subject.subjectId;
    });
};

Template.unansweredQuestions.helpers({
    myUnansweredQuestions: function() {
        var mySubjectIds = subjectIds(Meteor.user());

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
    otherUnansweredQuestions: function() {
        var mySubjectIds = subjectIds(Meteor.user());

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

Template.unansweredQuestionRow.onCreated(
    function unansweredQuestionRowOnCreated() {
        this.autorun(() => {
            this.subscribe('users');
        });
    }
);

Template.unansweredQuestionRow.helpers({
    status: function() {
        try {
            if (!this.editing || this.editing.length === 0) {
                return new Spacebars.SafeString('<td>Ubesvart</td>');
            } else {
                var usersEditing = this.editing
                    .map(function(userId) {
                        var user = Meteor.users.findOne({ _id: userId });
                        if (user && user.profile && user.profile.firstName) {
                            return user.profile.firstName;
                        } else {
                            return 'ukjent bruker';
                        }
                    })
                    .join(', ');

                return new Spacebars.SafeString(
                    "<td class='warning'>Redigeres av " + usersEditing + '</td>'
                );
            }
        } catch (error) {
            console.error(error);
            return new Spacebars.SafeString('<td>Ubesvart</td>');
        }
    }
});

Template.unverifiedQuestions.helpers({
    myApprovableQuestions: function() {
        var mySubjectIds = subjectIds(Meteor.user());

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
    otherApprovableQuestions: function() {
        var mySubjectIds = subjectIds(Meteor.user());

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

Template.answeredQuestionRow.onCreated(function answeredQuestionRowOnCreated() {
    this.autorun(() => {
        this.subscribe('users');
    });
});

Template.answeredQuestionRow.events({
    'click .verify-answer': function(event, template) {
        Meteor.call(
            'questions.verify',
            {
                questionId: this._id
            },
            function(error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    }
});

Template.answeredQuestionRow.helpers({
    username: function(userId) {
        var user = Meteor.users.findOne(userId);
        return user ? user.username : '';
    },
    status: function() {
        if (!this.editing || this.editing.length === 0) {
            return new Spacebars.SafeString('<td>Ubesvart</td>');
        } else {
            var usersEditing = this.editing
                .map(function(userId) {
                    var user = Meteor.users.findOne({ _id: userId });
                    if (user && user.profile && user.profile.firstName) {
                        return user.profile.firstName;
                    } else {
                        return 'ukjent bruker';
                    }
                })
                .join(', ');

            return new Spacebars.SafeString(
                "<td class='warning'>Redigeres av " + usersEditing + '</td>'
            );
        }
    }
});

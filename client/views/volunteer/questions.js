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

        return Questions.find({
            $and: [
                { answer: { $exists: false } },
                { subjectId: { $in: mySubjectIds } }
            ]
        });
    },
    otherUnansweredQuestions: function() {
        var mySubjectIds = subjectIds(Meteor.user());

        return Questions.find({
            $and: [
                { answer: { $exists: false } },
                { subjectId: { $nin: mySubjectIds } }
            ]
        });
    }
});

Template.unansweredQuestionRow.helpers({
    status: function() {
        try {
            if (!this.editing || this.editing.length === 0) {
                return new Spacebars.SafeString('<td>Ubesvart</td>');
            } else {
                var usersEditing = this.editing
                    .map(function(userId) {
                        var user = Meteor.users.findOne({ _id: userId });
                        if (user) {
                            return user.emails[0] && user.emails[0].address;
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

        return Questions.find({
            $and: [
                { answer: { $exists: true } },
                { lastUpdatedBy: { $exists: true } },
                { lastUpdatedBy: { $ne: Meteor.userId() } },
                { verifiedBy: { $exists: false } }
            ]
        });
    },
    otherApprovableQuestions: function() {
        var mySubjectIds = subjectIds(Meteor.user());

        return Questions.find({
            $and: [
                { answer: { $exists: true } },
                { lastUpdatedBy: { $exists: true } },
                { lastUpdatedBy: Meteor.userId() },
                { verifiedBy: { $exists: false } }
            ]
        });
    }
});

Template.answeredQuestionRow.events({
    'click .verify-answer': function(event, template) {
        Meteor.call(
            'verifyAnswer',
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
    status: function() {
        if (!this.editing || this.editing.length === 0) {
            return new Spacebars.SafeString('<td>Ubesvart</td>');
        } else {
            var usersEditing = this.editing
                .map(function(userId) {
                    var user = Meteor.users.findOne({ _id: userId });
                    if (user) {
                        return user.emails[0] && user.emails[0].address;
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

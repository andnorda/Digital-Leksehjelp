var subjectIds = function(user) {
    if (!user) { return []; }

    return user.profile.subjects.map(function(subject) {
        return subject.subjectId;
    });
}

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

Template.unverifiedQuestions.helpers({
    myApprovableQuestions: function() {
        var mySubjectIds = subjectIds(Meteor.user());

        return Questions.find({
            $and: [
                { answer: { $exists: true } },
                { answeredBy: { $exists: true } },
                { answeredBy: { $ne: Meteor.userId() } },
                { verifiedBy: { $exists: false } }
            ]
        });
    },
    otherApprovableQuestions: function() {
        var mySubjectIds = subjectIds(Meteor.user());

        return Questions.find({
            $and: [
                { answer: { $exists: true } },
                { answeredBy: { $exists: true } },
                { answeredBy: Meteor.userId() },
                { verifiedBy: { $exists: false } }
            ]
        });
    }
});

Template.answeredQuestionRow.events({
    'click .verify-answer': function(event, template) {
        Meteor.call('verifyAnswer',
        {
            questionId: this._id
        },
        function (error) {
            if (error) {
                FlashMessages.sendError(error.message);
            }
        });
    }
});

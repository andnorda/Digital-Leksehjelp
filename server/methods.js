// Helper methods
var generateRandomAppearInLink = function () {
    var randomId = Math.floor(Math.random() * 1000000000);
    return "http://appear.in/" + randomId;
};

Meteor.methods({
    createUserOnServer: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.username, String);
        check(options.email, String);
        check(options.profile.firstName, String);
        check(options.profile.role, String);

        options.profile.setSubjectsAvailable = true;
        options.profile.forceLogOut = false;
        options.profile.subjects = [];

        if (user.profile.role === ROLES.ADMIN) {
            var userId = Accounts.createUser(options);
            Accounts.sendEnrollmentEmail(userId);
            return userId;
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    createSessionOnServer: function (options) {
        check(options.subject, String);
        check(options.grade, String);
        check(options.queueNr, Number);

        var queueNr = options.queueNr + 1;
        var videoConferenceUrl = generateRandomAppearInLink();

        return StudentSessions.insert({
                subject: options.subject,
                grade: options.grade,
                videoConferenceUrl: videoConferenceUrl,
                state: STUDENT_SESSION_STATE.WAITING,
                queueNr: queueNr
            });
    },

    userLoggedOut: function (options) {
        check(options.userId, String);
        var user = Meteor.users.findOne(options.userId);
        var setSubjectsAvailable = user.profile.setSubjectsAvailable;
        if(!setSubjectsAvailable) {
            // TODO(martin): Could probably call setSubjectsAvailable here, but
            // setSubjectsAvailable must be set to true afterwards.
            for (var i = 0; i < user.profile.subjects.length; i++) {
                Subjects.update(
                    { _id: user.profile.subjects[i].subjectId },
                    {
                        $pull: { availableVolunteers: options.userId }
                    },
                    function (error, id) {
                        if (error) {
                            throw new Meteor.Error(500, "Server error, please try again.");
                        }
                    });
            };

            Meteor.users.update(user,
                {
                    $set: {
                            'profile.setSubjectsAvailable' : true
                        }
                });
        }
    }
});

// Helper methods
var generateRandomAppearInLink = function () {
    var randomId = Math.floor(Math.random() * 1000000000);
    return "http://appear.in/" + randomId;
};

Meteor.methods({
    uploadToS3: function(url){
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };
        console.log('Add '+url);

        check(url, String);

        Meteor.users.update(
            { _id: this.userId },
            {
                $set: {
                    'profile.pictureUrl' : url
                }
            });
    },

    getEnvironment: function () {
        if (process.env.ROOT_URL === "http://digitalleksehjelp.no") {
            return "production";
        } else return "development";
    },

    createUserOnServer: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.username, String);
        check(options.email, String);
        check(options.profile.firstName, String);
        check(options.profile.role, String);
        check(options.profile.allowVideohelp, Boolean);

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

    remoteLogOutUser: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.userId, String);

        if (user.profile.role === ROLES.ADMIN) {
            var remoteUser = Meteor.users.find(options.userId).fetch()[0];

            if(remoteUser.status.online) {
                Meteor.users.update(
                    { _id: options.userId },
                    { $set: {
                        'profile.forceLogOut': true
                        }
                    });
            } else {
                Meteor.users.update(
                    { _id: options.userId },
                    { $set: {
                        'services.resume.loginTokens' : [],
                        }
                    });
            }
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    sendAnswerEmail: function (question) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in."); };

        this.unblock();

        var html = SSR.render('answerEmailTemplate', question);

        Email.send({
            to: question.studentEmail,
            from: "Digital Leksehjelp <digitalleksehjelp@oslo.redcross.no>",
            subject: "Røde Kors - Digital Leksehjelp",
            html: html
        });

        Questions.update(
            { _id: question._id },
            { $unset: { studentEmail: "" } }
            );
    }
});

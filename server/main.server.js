// Server only logic, this will NOT be sent to the clients.

Meteor.startup(function () {
    Accounts.emailTemplates.from = "Digital Leksehjelp <digitalleksehjelp@oslo.redcross.no>";

    Meteor.call("S3config",{
        key: process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        bucket: 'digitalleksehjelp',
        directory: '/profilbilder/'
    });

    if(Meteor.users.find().count() === 0) {
        console.log("WARNING: NO USERS, DEFAULT ADMIN ACCOUNT ADDED");
        var options = {
            username: 'orkis@redcross.no',
            password: 'orkisadmin',
            profile: {
                role: ROLES.ADMIN,
                setSubjectsAvailable: true,
                forceLogOut: false,
                subjects: [],
                firstName: 'Orkis'
            },
            email: 'orkis@redcross.no'
        };
        Accounts.createUser(options);
    };

    var count = 0;
    var query = Meteor.users.find({
            $and: [
                { 'services.resume.loginTokens': { $exists:true } },
                { 'services.resume.loginTokens': { $not: { $size: 0 } }}
            ]});
    var initializing = true;
    var handle = query.observeChanges({
      added: function (id, user) {
        count++;
      },
      removed: function () {
        count--;
        if (count === 0) {
            Config.upsert({ name: "serviceStatus" }, { $set: { "open": false }});
        }
      }
    });

    Meteor.users.find({ "status.online" : true }).observe({
        removed: function (user) {
            Meteor.users.update({ _id: user._id }, { $set: { 'profile.forceLogOut': false }});
            for (var i = 0; i < user.profile.subjects.length; i++) {
                Subjects.update(
                    { _id: user.profile.subjects[i].subjectId },
                    { $pull: { availableVolunteers: user._id } },
                    function (error, nrOfDocsAffected) {
                        if (error) {
                            throw new Meteor.Error(500, "Server error, please try again.");
                        }
                    });
            };
            Meteor.users.update({ _id: user._id },
                    { $set: {
                                'profile.setSubjectsAvailable' : true
                            }
                    });
        }
    });
});

Accounts.validateNewUser(function (user) {
    // A simple check to avoid people from signing up from outside the
    // admin panel.
    if (!user.profile) {
        throw new Meteor.Error(403, "You are not allowed to create new users");
    }

    if (!user.profile.firstName) {
        throw new Meteor.Error(400, "The user needs a first name");
    }

    return true;
});

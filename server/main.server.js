// Server only logic, this will NOT be sent to the clients.

S3.config = {
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: 'digitalleksehjelp'
};

if (process.env.ROOT_URL === "http://digitalleksehjelp.no") {
    Kadira.connect('A8iXcSuRt35CN98xm', 'a5a34ea3-55be-4d7c-a079-9f2d5cbc1e0d');
}

Meteor.startup(function () {
    updateLastUpdatedBy();
    addHumanReadableIdToSubjectsCollection();
    addSlugToQuestions();

    Accounts.emailTemplates.from = "Digital Leksehjelp <digitalleksehjelp@oslo.redcross.no>";

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
                { 'services.resume.loginTokens': { $not: { $size: 0 } }},
                { 'profile.allowVideohelp': true },
                { 'profile.subjects.0': { $exists: true }}
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

            var subjectsLength = user.profile && user.profile.subjects && user.profile.subjects.length || 0;
            for (var i = 0; i < subjectsLength; i++) {
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

    SSR.compileTemplate('answerEmailTemplate', Assets.getText('answerEmailTemplate.html'));
    Template.answerEmailTemplate.helpers({
        transformNewline: function(text) {
            return new Spacebars.SafeString(text.replace(/(\r\n|\n|\r)/g, "<br>"));
        }
    });

    Questions._ensureIndex({
        question: "text",
        answer: "text"
    }, {
        name: "questionIndex",
        default_language: "norwegian",
        weights : {
            "question": 2,
            "answer": 1
        }
    });
});

Accounts.validateNewUser(function (user) {
    // A simple check to avoid people from signing up from outside the
    // admin panel.
    if (Meteor.users.find().count() > 0) {
        var loggedInUser = Meteor.user();
        if (!loggedInUser || !loggedInUser.profile || loggedInUser.profile.role !== ROLES.ADMIN) {
            throw new Meteor.Error(403, "You are not allowed to create new users");
        }
    }

    if (!user.profile) {
        throw new Meteor.Error(403, "You are not allowed to create new users");
    }

    if (!user.profile.firstName) {
        throw new Meteor.Error(400, "The user needs a first name");
    }

    return true;
});

var addSlugToQuestions = function () {
    var questions = Questions.find({ $and: [
        { slug: { $exists: false }},
        { answer: { $exists: true }},
        { title: { $exists: true }}
        ]}).fetch();

    questions.forEach(function (question) {
        if (question.title && question.title.length > 0) {
            Questions.update(
                { _id: question._id },
                { $set: {
                    slug: DigitalLeksehjelp.generateUniqueSlug(question.title)
                }});
        }
    });
}

var updateLastUpdatedBy = function () {
    var questions = Questions.find({ $and: [
        { lastUpdatedBy: { $exists: false }},
        { answeredBy: { $exists: true }}
        ]}).fetch();

    questions.forEach(function (question) {
        Questions.update(
            { _id: question._id },
            { $set: {
                lastUpdatedBy: question.answeredBy,
                lastUpdatedDate: question.answerDate
            }});
    });
}

var addHumanReadableIdToSubjectsCollection = function() {
    Subjects.find({humanReadableId: { $exists: false }}).forEach(function(subject) {
        Subjects.update(
            { _id: subject._id },
            { $set:
                { humanReadableId: DigitalLeksehjelp.urlify(subject.name) }
            });
    });

}

Meteor.publish("all-users", function () {
    var user = Meteor.users.findOne(this.userId);
    if(!user) { return null; }
    var fields;

    if (user.profile.role  === ROLES.ADMIN) {
        return Meteor.users.find({}, {fields: {username: 1, emails: 1, profile: 1}});
    }

    return null;
});

Meteor.publish("loggedInUsers", function () {
    var user = Meteor.users.findOne(this.userId);
    var publicLoggedInCursor = Meteor.users.find({
            $and: [
                { 'services.resume.loginTokens': { $exists:true } },
                { 'services.resume.loginTokens': { $not: { $size: 0 } }}
            ]
        },
        {
            fields: {
                'profile.pictureUrl': 1,
                'profile.firstName': 1,
                'profile.subjects': 1,
                //TODO(martin): These last two fields could be more restricted
                'profile.role': 1,
                'services.resume.loginTokens': 1
            }
        });

    if (!user) {
        return publicLoggedInCursor;
    }

    var userRole = user.profile.role;

    if (userRole  === ROLES.ADMIN) {
        return Meteor.users.find({
            $and: [
                { 'services.resume.loginTokens': { $exists:true } },
                { 'services.resume.loginTokens': { $not: { $size: 0 } }}
            ]
        });
    } else {
        return publicLoggedInCursor;
    }
});

Meteor.publish("user-data", function () {
    return Meteor.users.findOne(this.userId);
});

Meteor.publish("student-queue", function () {
    var self = this;
    var id = Random.id();
    var handle = StudentSessions.find({ state: STUDENT_SESSION_STATE.WAITING })
        .observeChanges({
            added: function (id, fields) {
                self.added("student-queue", id, { queueNr: fields.queueNr, subject: fields.subject });
            },
            removed: function (id) {
                self.removed("student-queue", id);
            }
        });

    self.ready();

    self.onStop(function () {
        handle.stop();
    });
});

Meteor.publish("sessions", function (sessionId) {
    var user = Meteor.users.findOne(this.userId);
    if (!user) {
        check(sessionId, Match.OneOf(String, null));
        return StudentSessions.find({ _id: sessionId });
    }

    return StudentSessions.find({});
});

Meteor.publish("subjects", function () {
    return Subjects.find({});
});

Meteor.publish("openingHours", function () {
    return Config.find({ name: "openingHours" });
});

Meteor.publish("serviceStatus", function () {
    return Config.find({ name: "serviceStatus"});
});

Meteor.publish("config", function () {
    var user = Meteor.users.findOne(this.userId);
    if (!user) { return null; }

    if (user.profile.role === ROLES.ADMIN) {
        return Config.find({});
    }
});

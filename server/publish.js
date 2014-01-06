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
    if (!user) { return null; }
    if (user.profile.role  === ROLES.ADMIN) {
        return Meteor.users.find({
            $and: [
                { 'services.resume.loginTokens': { $exists:true } },
                { 'services.resume.loginTokens': { $not: { $size: 0 } }}
            ]});
    }

    throw new Meteor.Error(403, "You are not allowed to access this.");
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

Meteor.publish("subjects", function () {
    var user = Meteor.users.findOne(this.userId);
    if (!user) { return null; }

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

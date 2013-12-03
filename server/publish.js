if(Meteor.isServer) {
    Meteor.publish("all-users", function () {
        var user = Meteor.users.findOne(this.userId);
        if(!user) { return null; }
        var fields;

        if (user.role === ROLES.admin) {
            console.log("This user is an administrator!");
            //Return everythin'
            return Meteor.users.find({});
        }

        console.log("This user is NOT admin, does not get any data...");
    });

    Meteor.publish("user-data", function () {
        return Meteor.users.findOne(this.userId);
    });

    Meteor.publish("student-queue", function () {
        var self = this;
        var id = Random.id();
        var handle = StudentSessions.find({ state: STUDENT_SESSION_STATE.WAITING }).observeChanges({
            added: function (id, fields) {
                self.added("student-queue", id, { queueNr: fields.queueNr });
            },
            removed: function (id) {
                self.removed("student-queue", id);
            }
            // don't care about moved or changed
        });

        // Observe only returns after the initial added callbacks have
        // run.  Now return an initial value and mark the subscription
        // as ready.
        self.ready();

        // Stop observing the cursor when client unsubs.
        // Stopping a subscription automatically takes
        // care of sending the client any removed messages.
        self.onStop(function () {
            handle.stop();
        });
    });
}

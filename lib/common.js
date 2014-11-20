// Logic common for both client and server.
// Everything in the /lib folder is loaded before anything else
this.DigitalLeksehjelp = {
    getQueueTime: function (startTime, unit) {
        var queueEndTime = new Date().getTime();
        var totalTime = queueEndTime - startTime;

        switch (unit) {
            case "minutes":
                totalTime = Math.round(totalTime/60000);
                break;

            case "seconds":
                totalTime = Math.round(totalTime/1000);
                break;
        }
        return totalTime;
    }
};

StudentSessions = new Meteor.Collection("sessions");
StudentQueue = new Meteor.Collection("student-queue");
Subjects = new Meteor.Collection("subjects");
Config = new Meteor.Collection("config");
Questions = new Meteor.Collection("questions");

STUDENT_SESSION_STATE = {
    WAITING : "Venter på en ledig frivillig",
    READY : "Frivillig er klar",
    REJECTED: "Beklager, ingen frivillige hadde mulighet til å hjelpe deg nå",
    GETTING_HELP: "Får leksehjelp"
};

GRADES = [
    '8. klasse',
    '9. klasse',
    '10. klasse',
    'Vg 1',
    'Vg 2',
    'Vg 3'
];

ROLES = {
    ADMIN: 'Administrator',
    TUTOR: 'Frivillig'
};

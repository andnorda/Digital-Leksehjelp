// Logic common for both client and server.
// Everything in the /lib folder is loaded before anything else

StudentSessions = new Meteor.Collection("sessions");
StudentQueue = new Meteor.Collection("student-queue");
Subjects = new Meteor.Collection("subjects");
Config = new Meteor.Collection("config");

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

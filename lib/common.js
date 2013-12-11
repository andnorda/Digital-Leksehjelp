// Logic common for both client and server.
// Everything in the /lib folder is loaded before anything else

StudentSessions = new Meteor.Collection("sessions");
StudentQueue = new Meteor.Collection("student-queue");


STUDENT_SESSION_STATE = {
    WAITING : "Venter på en ledig frivillig",
    READY : "Frivillig er klar",
    REJECTED: "Beklager, ingen frivillige hadde mulighet til å hjelpe deg nå",
    GETTING_HELP: "Får leksehjelp"
};

//TODO(martin): Rewrite this to a published collection,
// so the admins can change the list of courses.
COURSES = [
    'Matematikk',
    'Engelsk',
    'Naturfag',
    'Samfunnsfag',
    'Norsk',
    'Fysikk',
    'Kjemi',
    'Tysk'
];

GRADES = [
    '1. klasse',
    '2. klasse',
    '3. klasse',
    '4. klasse',
    '5. klasse'
];

ROLES = {
    ADMIN: 'Administrator',
    TUTOR: 'Frivillig'
};

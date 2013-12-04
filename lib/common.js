// Logic common for both client and server.
// Everything in the /lib folder is loaded before anything else

StudentSessions = new Meteor.Collection("sessions");
Config = new Meteor.Collection("config");

STUDENT_SESSION_STATE = {
    WAITING : "Venter på ledig veileder",
    READY : "Veileder er klar",
    REJECTED: "Beklager, ingen veiledere hadde mulighet til å hjelpe deg nå",
    GETTING_HELP: "Får leksehjelp"
};

//TODO(martin): Rewrite this to a published collection,
// so the admins can change the list of courses.
COURSES = [
    'Matematikk',
    'Engelsk'
];

ROLES = {
    ADMIN: 'Administrator',
    TUTOR: 'Tutor'
};

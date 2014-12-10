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
    },

    urlify: function(str) {
        return str.toLowerCase().replace(/ +/g, '-').replace(/æ/g, 'ae').
        replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9\-]/g, '');
    }
};

StudentSessions = new Mongo.Collection("sessions");
StudentQueue = new Mongo.Collection("student-queue");
Subjects = new Mongo.Collection("subjects");
Config = new Mongo.Collection("config");
Questions = new Mongo.Collection("questions");

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

CONSTANTS = {
    RELATED_QUESTION_SEARCH_THRESHOLD: 1000,
    RELATED_QUESTION_SEARCH_MIN_QUESTION_LENGTH: 3,
    RELATED_QUESTION_SEARCH_LIMIT: 10,
    SEARCH_DEFAULT_LIMIT: 100,
    S3_MAX_UPLOAD_FILE_SIZE: 1024 * 1024 * 5
};

var generateRandomAppearInLink = function () {
    var randomId = Math.floor(Math.random() * 1000000000);
    return "http://appear.in/" + randomId;
};

var getHighestQueueNr = function () {
    if(StudentQueue.find({}).count() === 0) {
        return 0;
    }
    return StudentQueue.find({}, { sort: { queueNr: -1 }, limit: 1 }).fetch()[0].queueNr;
};

// === GETHELP ===
var validationErrorDep = new Deps.Dependency;
var validationError;

Template.getHelp.validationError = function () {
    validationErrorDep.depend();
    return validationError;
};

Template.getHelp.openingHours = function () {
    var openingHoursArray = Config.find({ name: "openingHours" }).fetch();

    if (openingHoursArray.length > 0) {
        return Config.find({ name: "openingHours" }).fetch()[0].text;
    }
    return "";
};

Template.getHelp.events({
    'click button#createSession' : function () {
        Session.set("videoConferenceUrl", generateRandomAppearInLink());
        var queueNr = getHighestQueueNr() + 1;
        var chosenSubject = $('#chosenSubject').text().trim();
        var chosenGrade = $('#chosenGrade').text().trim();

        if (chosenSubject === "Velg ønsket fag") {
            validationError = "Feil: Du må velge et fag";
            validationErrorDep.changed();
        } else if (chosenGrade === "Velg ditt trinn") {
            validationError = "Feil: Du må velge et trinn";
            validationErrorDep.changed();
        } else {
            validationError = null;
            validationErrorDep.changed();
            StudentSessions.insert({
                subject: chosenSubject,
                grade: chosenGrade,
                videoConferenceUrl: Session.get("videoConferenceUrl"),
                state: STUDENT_SESSION_STATE.WAITING,
                queueNr: queueNr
            }, function (error, id) {
                if (error) { return null; };
                Session.set("studentSessionId", id);
                Session.set("queueNr", queueNr);
                Session.set("subject", chosenSubject);
                $('#queueModal').modal();
            });
        }
    },

    'click .disabled-li' : function (event) {
        event.preventDefault();
        return false;
    }
});

// === SUBJECTSELECTOR ===
Template.subjectSelector.subjects = function () {
    return Subjects.find({});
};

Template.subjectSelector.events({
    'click .subjects' : function (event) {
        if(!$(event.target).hasClass("disabled-li")) {
            $('#chosenSubject').text(this.name);
        }
    }
});

// === GRADESELECTOR ===
Template.gradeSelector.grades = function () {
    return GRADES;
};

Template.gradeSelector.events({
    'click .grades' : function () {
        $('#chosenGrade').text(this);
    }
});

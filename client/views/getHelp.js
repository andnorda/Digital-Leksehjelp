// === GETHELP ===
var validationErrorDep = new Deps.Dependency;
var validationError;

var getHighestQueueNr = function () {
    if(StudentQueue.find({}).count() === 0) {
        return 0;
    }
    return StudentQueue.find({}, { sort: { queueNr: -1 }, limit: 1 }).fetch()[0].queueNr;
};

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

Template.getHelp.openingHoursLoaded = function () {
    return Session.get("openingHoursLoaded");
};

Template.getHelp.serviceStatusLoaded = function () {
    return Session.get("serviceStatusLoaded");
};

Template.getHelp.open = function () {
    var serviceStatusArray = Config.find({ name: "serviceStatus" }).fetch();

    if (serviceStatusArray.length > 0) {
        return serviceStatusArray[0].open;
    }
    return false;
};

Template.getHelp.events({
    'click button#createSession' : function () {
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
            mixpanel.track("Bedt om leksehjelp", { "fag": chosenSubject, "trinn": chosenGrade });
            Meteor.call('createSessionOnServer',
                {
                    subject: chosenSubject,
                    grade: chosenGrade,
                    queueNr: getHighestQueueNr()
                },
                function (error, sessionId) {
                    if (error) {
                        validationError = "Beklager, det oppstod en feil. Vennligst prøv igjen.";
                        validationErrorDep.changed();
                    } else {
                        Session.set("studentSessionId", sessionId);
                        Session.set("queueStartTime", new Date().getTime());
                        $('#queueModal').modal();
                    }
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

// === GETHELP ===
var validationErrorDep = new Deps.Dependency;
var validationError;

var getHighestQueueNr = function () {
    if(StudentQueue.find({}).count() === 0) {
        return 0;
    }
    return StudentQueue.find({}, { sort: { queueNr: -1 }, limit: 1 }).fetch()[0].queueNr;
};

Template.getHelp.helpers({
    validationError: function () {
        validationErrorDep.depend();
        return validationError;
    },
    openingHours: function () {
        var openingHoursArray = Config.find({ name: "openingHours" }).fetch();

        if (openingHoursArray.length > 0) {
            return Config.find({ name: "openingHours" }).fetch()[0].text;
        }
        return "";
    },
    openingHoursLoaded: function () {
        return Session.get("openingHoursLoaded");
    },
    serviceStatusLoaded: function () {
        return Session.get("serviceStatusLoaded");
    },
    subjectsWithAnswers: function () {
        return Subjects.find({});
    }
});

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
    },

    'click #ask-question' : function (event) {
        event.preventDefault();
        Router.go('askQuestion');
    }
});

// === SUBJECTSELECTOR ===
Template.subjectSelector.helpers({
    subjects: function () {
        return Subjects.find({});
    },
    subjectDisabled: function (availableVolunteers) {
        if(availableVolunteers > 0) {
            return '';
        } else {
            return 'disabled-li';
        }
    }
});

Template.subjectSelector.events({
    'click .subjects' : function (event) {
        if(!$(event.target).hasClass("disabled-li")) {
            $('#chosenSubject').text(this.name);
        }
    }
});

// === GRADESELECTOR ===
Template.gradeSelector.helpers({
    grades: function () {
        return GRADES;
    }
});

Template.gradeSelector.events({
    'click .grades' : function () {
        $('#chosenGrade').text(this);
    }
});

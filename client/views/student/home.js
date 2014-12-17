var validationErrorDep = new Deps.Dependency;
var validationError;

var getHighestQueueNr = function () {
    if(StudentQueue.find({}).count() === 0) {
        return 0;
    }
    return StudentQueue.find({}, { sort: { queueNr: -1 }, limit: 1 }).fetch()[0].queueNr;
};

Template.getHelpBox.helpers({
    activeQuestionButton: function() {
        var serviceStatus = Config.findOne({ name: "serviceStatus" });
        if (serviceStatus && serviceStatus.open) {
            return "";
        }
        return "active";
    }
});

Template.getHelpBox.events({
    'click .question-button' : function (event) {
        event.preventDefault();
        Router.go('askQuestion');
    }
});

Template.videoHelp.events({
    'click a#more-info' : function (event) {
        $('#moreInfoModal').modal();
    }
});

Template.getVideoHelp.helpers({
    validationError: function (errorType) {
        validationErrorDep.depend();
        if (validationError && validationError.indexOf(errorType) > -1) {
            return "validation-error";
        }
    },
    openingHours: function () {
        var openingHoursArray = Config.find({ name: "openingHours" }).fetch();

        if (openingHoursArray.length > 0) {
            return Config.find({ name: "openingHours" }).fetch()[0].text;
        }
        return "";
    },
    serviceStatusLoaded: function () {
        return Session.get("serviceStatusLoaded");
    },
    videoHelpDisabled: function () {
        var serviceStatus = Config.findOne({ name: "serviceStatus" });
        if (serviceStatus && serviceStatus.open) {
            return "";
        }
        return "disabled";
    },
    subjectDisabled: function (availableVolunteers) {
        if(availableVolunteers > 0) {
            return '';
        } else {
            return 'disabled-li';
        }
    }
});

Template.getVideoHelp.events({
    'click button#start-video-session' : function (event) {

        API.isAppearinCompatible(function (data) {
            if (!data.isSupported) {
                $('#notSupportedModal').modal();
                mixpanel.track("Feilet teknisk sjekk");
                return;
            }

            if ($("button#start-video-session").hasClass("disabled")) {
                return;
            }

            var chosenSubject = $('#chosen-subject').text().trim();
            var chosenGrade = $('#chosen-grade').text().trim();

            validationError = [];
            validationErrorDep.changed();
            if (chosenSubject === "Velg fag") {
                validationError.push("subjectError");
                validationErrorDep.changed();
            }
            if (chosenGrade === "Velg trinn") {
                validationError.push("gradeError");
                validationErrorDep.changed();
            }
            if (validationError.length === 0) {
                mixpanel.track("Bedt om leksehjelp", { "fag": chosenSubject, "trinn": chosenGrade });
                Meteor.call('createSessionOnServer',
                    {
                        subject: chosenSubject,
                        grade: chosenGrade,
                        queueNr: getHighestQueueNr()
                    },
                    function (error, sessionId) {
                        if (error) {
                            validationError.push("sessionError");
                            validationErrorDep.changed();
                        } else {
                            Session.set("studentSessionId", sessionId);
                            Session.set("queueStartTime", new Date().getTime());
                            $('#queueModal').modal();
                        }
                    });
            }
        });
    },

    'click .disabled-li' : function (event) {
        event.preventDefault();
        return false;
    },

    'click .subjects' : function (event) {
        if(!$(event.target).hasClass("disabled-li")) {
            $('#chosen-subject').text(this.name);
        }
    },

    'click .grades' : function () {
        $('#chosen-grade').text(this);
    }
});

Template.previousQuestions.helpers({
    previousQuestions: function (skip, limit) {
        return Questions.find({}, {sort: {questionDate: -1}, skip: skip, limit: limit});
    },
    numberOfQuestions: function() {
        var numberOfQuestions = Session.get("numberOfQuestions");
        if (numberOfQuestions) {
            return " (" + numberOfQuestions + ")";
        }
    }
});

Template.todaysVolunteers.helpers({
    todaysVolunteers: function () {
        return Meteor.users.find({
            $and: [
                { 'status.online': true },
                { 'profile.firstName': { $not: "Orkis" }},
                { 'profile.subjects.0': { $exists: true }}
            ]}).fetch();
    },
    subjectList: function (subjects) {
        var subjectNames = subjects.map(function(subject) {
            return subject.subjectName;
        });

        if (subjectNames.length > 1) {
            var subjectNamesStr = "";
            for (var i = 0; i < subjectNames.length - 1; i++) {
                subjectNamesStr += subjectNames[i] + ", ";
            }
            return subjectNamesStr.substring(0, subjectNamesStr.length - 2) +
                " og " + subjectNames[subjectNames.length-1];
        } else {
            return subjectNames.join("");
        }
    }
});

Template.otherActivities.events({
    'click a.textLink' : function (event) {
        mixpanel.track("Andre aktiviteter", { "url": event.currentTarget.href });
    }
});

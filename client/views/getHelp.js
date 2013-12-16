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

var videoConferenceDep = new Deps.Dependency();
var videoConferenceUrl;

// === GETHELP ===
Template.getHelp.videoConferenceUrl = function () {
    videoConferenceDep.depend();
    return videoConferenceUrl;
};

Template.getHelp.studentSession = function () {
    return StudentSessions.find({ _id: Session.get("studentSessionId") }).fetch()[0];
};

Template.getHelp.stateReady = function () {
    return Template.getHelp.studentSession().state == STUDENT_SESSION_STATE.READY;
};

Template.getHelp.stateWaiting = function () {
    return Template.getHelp.studentSession().state == STUDENT_SESSION_STATE.WAITING;
};

// TODO(martin): Rewrite to use Dependency? Is it needed?
// See http://docs.meteor.com/#deps
// and http://docs.meteor.com/#meteor_publish
Template.getHelp.queueSize = function () {
    var queueSize = StudentQueue.find({}).count();
    if (!queueSize) {
        return "";
    } else {
        return queueSize;
    }
};

Template.getHelp.studentsInFront = function () {
    var studentsInFront = StudentQueue.find({ queueNr: { $lt: Session.get("queueNr") }}).count();
    return studentsInFront;
};

Template.getHelp.events({
    'click button#getHelp' : function () {
        window.open(this.videoConferenceUrl);
        StudentSessions.update(
            { _id: Session.get("studentSessionId") },
            { $set: { state: STUDENT_SESSION_STATE.GETTING_HELP } });
    },

    'click button#createSession' : function () {
        videoConferenceUrl = generateRandomAppearInLink();
        videoConferenceDep.changed();
        Session.set("videoConferenceUrl", videoConferenceUrl);
        var queueNr = getHighestQueueNr() + 1;
        console.log("queueNr = " + queueNr);
        console.log("subject = " + $('#chosenSubject').text());
        console.log("grade = " + $('#chosenGrade').text());
        StudentSessions.insert({
            subject: $('#chosenSubject').text(),
            grade: $('#chosenGrade').text(),
            // topic: $('#topic').val(),
            videoConferenceUrl: videoConferenceUrl,
            state: STUDENT_SESSION_STATE.WAITING,
            queueNr: queueNr
        }, function (error, id) {
            if (error) { return null; };
            Session.set("studentSessionId", id);
            Session.set("queueNr", queueNr);
        });
        $('#subject').val("");
        $('#grade').val("");
        $('#topic').val("");
    }
});

// === SUBJECTSELECTOR ===
Template.subjectSelector.subjects = function () {
    return COURSES;
};

Template.subjectSelector.events({
    'click .subjects' : function () {
        $('#chosenSubject').text(this);
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

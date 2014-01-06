Template.studentSessionsTable.myStudentSessions = function () {
    var query = {
        "$or": []
    };
    var subjects = Meteor.user().profile.subjects;
    for (var i = 0; i < subjects.length; i++) {
        query.$or.push({ "subject": subjects[i].subjectName });
    };

    if (query.$or.length === 0) {
        return null;
    } else {
        return StudentSessions.find(query);
    }
};

Template.studentSessionsTable.otherStudentSessions = function () {
    var query = {
        "$and": []
    };
    var subjects = Meteor.user().profile.subjects;
    for (var i = 0; i < subjects.length; i++) {
        query.$and.push({ "subject": { $ne: subjects[i].subjectName } });
    };

    if (query.$and.length === 0) {
        return null;
    } else {
        return StudentSessions.find(query);
    }
};

Template.studentSessionRow.events({
    'click .startTutoring' : function () {
        window.open(this.videoConferenceUrl, '_blank');
        StudentSessions.update(
            { _id: this._id },
            { $set: { state: STUDENT_SESSION_STATE.READY, tutor: Meteor.user().profile.firstName }
        });
        Session.set("studentSessionId", this._id);
        $('#endSessionModal').modal();
    },

    'click .deleteSession' : function () {
        StudentSessions.remove(this._id);
    }
});

// === OPENSERVICE ===
Template.openService.events({
    'click button#openService' : function () {
        Meteor.call('upsertServiceStatus',
            {
                newServiceStatus: true
            },
            function (error, data) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            });
    }
});

Template.openService.open = function () {
    return Template.serviceStatus.open();
}

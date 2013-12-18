Template.studentSessionsTable.myStudentSessions = function () {
    var query = {
        "$or": []
    };
    var subjects = Meteor.user().profile.subjects;
    for (var i = 0; i < subjects.length; i++) {
        query.$or.push({ "subject": subjects[i] });
    };
    return StudentSessions.find(query);
};

Template.studentSessionsTable.otherStudentSessions = function () {
    var query = {
        "$and": []
    };
    var subjects = Meteor.user().profile.subjects;
    for (var i = 0; i < subjects.length; i++) {
        query.$and.push({ "subject": { $ne: subjects[i] } });
    };
    return StudentSessions.find(query);
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

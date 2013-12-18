// START STUDENTSSESSIONSTABLE
Template.studentSessionsTable.studentSessions = function () {
    return StudentSessions.find();
};

/**
* studentSessionItem
*/
Template.studentSessionItem.events({
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

// START STUDENTSSESSIONSTABLE
Template.studentSessionsTable.studentSessions = function () {
    return StudentSessions.find();
};

/**
* studentSessionItem
*/
Template.studentSessionItem.events({
    'click .startTutoring' : function () {
        console.log("TUTOR = ");
        console.log(Meteor.user().profile);
        window.open(this.videoConferenceUrl, '_blank');
        StudentSessions.update({ _id: this._id }, { $set: { state: STUDENT_SESSION_STATE.READY, tutor: Meteor.user().profile.firstName } });
        if (typeof console !== 'undefined') {
            console.log("You pressed the startTutoring button");
        };
    },

    'click .deleteSession' : function () {
        StudentSessions.remove(this._id);
    }
});

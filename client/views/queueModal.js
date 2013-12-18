Template.queueModal.events({
    'click button#leaveQueue' : function () {
        StudentSessions.remove({ _id: Session.get("studentSessionId") });
    }
});

Template.queueModal.rendered = function () {
    $('#queueModal').on('hide.bs.modal', function () {
        $('#queueModal').off('hide.bs.modal');
    })
}

Template.queueModalBody.studentSession = function () {
    return StudentSessions.find({ _id: Session.get("studentSessionId") }).fetch()[0];
};

Template.queueModalBody.stateWaiting = function () {
    return Template.queueModalBody.studentSession().state == STUDENT_SESSION_STATE.WAITING;
};

Template.queueModalBody.studentsInFront = function () {
    var studentsInFront = StudentQueue.find({ queueNr: { $lt: Session.get("queueNr") }}).count();
    return studentsInFront;
};

Template.queueModalBody.stateReady = function () {
    return Template.queueModalBody.studentSession().state == STUDENT_SESSION_STATE.READY;
};

Template.queueModalBody.events({
    'click button#getHelp' : function () {
        window.open(this.videoConferenceUrl);
        StudentSessions.update(
            { _id: Session.get("studentSessionId") },
            { $set: { state: STUDENT_SESSION_STATE.GETTING_HELP } });
    }
});

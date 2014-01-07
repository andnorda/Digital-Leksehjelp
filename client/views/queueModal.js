Template.queueModal.events({
    'click button#leaveQueue' : function () {
        Meteor.call('removeSession',
            {
                sessionId: Session.get("studentSessionId")
            });
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
    return StudentQueue.find({ $and: [
            { queueNr: { $lt: Template.queueModalBody.studentSession().queueNr } },
            { subject: Template.queueModalBody.studentSession().subject }
        ]}).count();
};

Template.queueModalBody.stateReady = function () {
    return Template.queueModalBody.studentSession().state == STUDENT_SESSION_STATE.READY;
};

Template.queueModalBody.events({
    'click button#getHelp' : function () {
        window.open(this.videoConferenceUrl);

        Meteor.call('setSessionState',
        {
            sessionId: Session.get("studentSessionId"),
            state: STUDENT_SESSION_STATE.GETTING_HELP
        });
    }
});

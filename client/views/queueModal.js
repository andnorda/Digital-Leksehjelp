Template.queueModal.rendered = function () {
    var elem = $('#queueModal')[0];
    var data = $.hasData(elem) && $._data(elem);

    if (data && data.events) {
        if (!data.events.hidden) {
            $('#queueModal').on('hidden.bs.modal', function () {
                var session = Template
                    .queueModalBody
                    .studentSession();
                if (session && (session.state !== STUDENT_SESSION_STATE.GETTING_HELP)) {
                    mixpanel.track("Forlot leksehjelp-kø",
                        {
                            "Minutter i kø" : DigitalLeksehjelp.getQueueTime(
                                Session.get("queueStartTime"), "minutes")
                        });
                    Meteor.call('removeSession',
                    {
                        sessionId: Session.get("studentSessionId")
                    });
                }
                $(this).off('hidden.bs.modal');
            });
        }
    }
};

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
    var stateReady = Template.queueModalBody.studentSession().state == STUDENT_SESSION_STATE.READY;
    if (stateReady) {
        flashTitle("Leksehjelpen er klar!", 20);
    }
    return stateReady;
};

Template.queueModalBody.events({
    'click button#getHelp' : function () {
        mixpanel.track("Fullført kø, og gått til rom",
            {
                "Minutter i kø": DigitalLeksehjelp.getQueueTime(
                    Session.get("queueStartTime"), "minutes")
            });
        window.open(this.videoConferenceUrl);

        Meteor.call('setSessionState',
        {
            sessionId: Session.get("studentSessionId"),
            state: STUDENT_SESSION_STATE.GETTING_HELP
        });

        cancelFlashTitle();
    }
});

Template.queueModal.rendered = function () {
    var elem = $('#queueModal')[0];
    var data = $.hasData(elem) && $._data(elem);

    if (data && data.events) {
        if (!data.events.hidden) {
            $('#queueModal').on('hidden.bs.modal', function () {
                var session = studentSession();
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

var studentSession = function () {
    return StudentSessions.findOne({ _id: Session.get("studentSessionId") });
}

Template.queueModalBody.helpers({
    studentSession: function () {
        return studentSession();
    },
    stateWaiting: function () {
        var studentSession = studentSession();
        return studentSession && studentSession.state == STUDENT_SESSION_STATE.WAITING;
    },
    studentsInFront: function () {
        var studentSession = studentSession();
        return StudentQueue.find({ $and: [
                { queueNr: { $lt: studentSession.queueNr } },
                { subject: studentSession.subject }
            ]}).count();
    },
    stateReady: function () {
        var studentSession = studentSession();
        var stateReady = studentSession && studentSession.state == STUDENT_SESSION_STATE.READY;
        if (stateReady) {
            flashTitle("Leksehjelpen er klar!", 20);
        }
        return stateReady;
    }
});

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

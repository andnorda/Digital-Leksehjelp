Template.endSessionModal.events({
    'click button#deleteSessionFromModal' : function () {
        console.log("Should delete the session now...", Session.get("studentSessionId"));
        StudentSessions.remove({_id: Session.get("studentSessionId")});
    }
});

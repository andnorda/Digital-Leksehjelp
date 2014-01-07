Template.endSessionModal.events({
    'click button#deleteSessionFromModal' : function () {
        Meteor.call('removeSession',
            {
                sessionId: Session.get("studentSessionId")
            });

    }
});

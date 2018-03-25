import './endSessionModal.html';

Template.endSessionModal.events({
    'click button#deleteSessionFromModal': function() {
        var helpDurationMinutes = DigitalLeksehjelp.getQueueTime(
            Session.get('startTutoringTime')
        );
        if (helpDurationMinutes > 4) {
            mixpanel.track('Hjulpet elev', {
                'Minutter i samtale': helpDurationMinutes
            });
        }

        Meteor.call('studentSessions.remove', {
            sessionId: Session.get('studentSessionId')
        });
    }
});

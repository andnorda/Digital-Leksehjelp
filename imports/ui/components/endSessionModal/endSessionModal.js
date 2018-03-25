import './endSessionModal.html';

Template.endSessionModal.events({
    'click button#deleteSessionFromModal': function() {
        var helpDurationMinutes = DigitalLeksehjelp.getQueueTime(
            Session.get('startTutoringTime'),
            'minutes'
        );
        if (helpDurationMinutes > 4) {
            mixpanel.track('Hjulpet elev', {
                'Minutter i samtale': helpDurationMinutes
            });
        }

        Meteor.call('removeSession', {
            sessionId: Session.get('studentSessionId')
        });
    }
});

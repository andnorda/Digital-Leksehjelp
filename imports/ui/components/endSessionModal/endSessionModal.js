import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import mixpanel from '/imports/mixpanel.js';
import { getQueueTime } from '/imports/utils.js';

import './endSessionModal.html';

Template.endSessionModal.events({
    'click button#deleteSessionFromModal'() {
        const helpDurationMinutes = getQueueTime(
            Session.get('startTutoringTime')
        );
        if (helpDurationMinutes > 4) {
            mixpanel.track('Hjulpet elev', {
                'Minutter i samtale': helpDurationMinutes,
                type: 'video'
            });
        }

				$('#helpEndedForm').modal();
        Meteor.call('studentSessions.endTutoring', Session.get('studentSessionId'));
    }
});

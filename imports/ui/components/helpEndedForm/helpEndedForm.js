import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import mixpanel from '/imports/mixpanel.js';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';

import './helpEndedForm.html';
import './helpEndedForm.less';

Template.helpEndedForm.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('studentSessions.byId', Session.get('studentSessionId'));
    });
});

Template.helpEndedForm.helpers({
    no() {
        return Template.instance().state.get('no');
    },
    description() {
        return Template.instance().state.get('description');
    }
});


Template.helpEndedForm.events({
    'click button.yes'() {
        const sessionId = Session.get('studentSessionId');
        const session = StudentSessions.findOne(sessionId);
        mixpanel.track('Frivillig rapportert leksehjelp utført', {
            fag: session.subject,
            type: session.type
        });
        Template.instance().state.clear();
    },
    'click button.no'() {
        Template.instance().state.set('no', true);
    },
    'click button.done'() {
        const state = Template.instance().state;
        const sessionId = Session.get('studentSessionId');
        const session = StudentSessions.findOne(sessionId);
        mixpanel.track(
            'Frivillig rapportert leksehjelp feilet',
            {
                beskrivelse: state.get('description'),
                årsak: state.get('cause'),
                fag: session.subject,
                type: session.type
            }
        );
        state.clear();
    },
    'input textarea[name=description]'(event) {
        Template.instance().state.set('description', event.target.value);
    },
    'change input[name=cause]'(event) {
        Template.instance().state.set('cause', event.target.value);
    }
});


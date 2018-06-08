import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { ReactiveDict } from 'meteor/reactive-dict';
import escape from 'escape-string-regexp';
import { Questions } from '/imports/api/questions/questions.js';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';

import './addVolunteer.html';

Template.addVolunteer.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('filter', '');

    this.autorun(() => {
        this.subscribe('users.loggedIn');
        this.subscribe('studentSessions');
    });
});

Template.addVolunteer.events({
    'click button.cancel'() {
        this.hide();
    },
    'input input.filter-field'(event) {
        Template.instance().state.set('filter', event.target.value);
    }
});

Template.addVolunteer.helpers({
    volunteers() {
        const { params: { sessionId } } = Router.current();

        const volunteerIds = StudentSessions.findOne(sessionId).volunteers.map(
            volunteer => volunteer.id
        );

        return Meteor.users.find({
            $and: [
                {
                    'profile.firstName': {
                        $regex: `.*${escape(
                            Template.instance().state.get('filter')
                        )}.*`
                    }
                },
                { 'status.online': true },
                ...volunteerIds.map(id => ({ _id: { $ne: id } }))
            ]
        });
    }
});

Template.addVolunteerListItem.events({
    'click .volunteer'() {
        const { params: { sessionId } } = Router.current();
        Meteor.call('studentSessions.addVolunteer', sessionId, this._id);
    }
});

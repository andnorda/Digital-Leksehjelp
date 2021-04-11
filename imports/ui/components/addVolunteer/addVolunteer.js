import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import escape from 'escape-string-regexp';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';

import './addVolunteer.html';

Template.addVolunteer.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('filter', '');

    this.autorun(() => {
        this.subscribe('users');
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
                        )}.*`,
                        $options: 'i'
                    }
                },
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

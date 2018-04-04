import { Mongo } from 'meteor/mongo';
import { addWeeks } from 'date-fns';
import { Shifts } from '/imports/api/shifts/shifts.js';

import './subjectAvailability.html';

Template.subjectAvailability.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('subject', 'Norsk');

    this.autorun(() => {
        this.subscribe('shifts.bySubjectName', this.state.get('subject'));
    });
});

Template.subjectAvailability.helpers({
    availabilities() {
        return Shifts.find({
            start: {
                $gt: new Date()
            },
            end: {
                $lt: addWeeks(new Date(), 2)
            },
            subjects: {
                $elemMatch: {
                    $eq: Template.instance().state.get('subject')
                }
            }
        });
    }
});

Template.subjectAvailability.events({
    'input input.subject-field'(event) {
        Template.instance().state.set('subject', event.target.value);
    }
});

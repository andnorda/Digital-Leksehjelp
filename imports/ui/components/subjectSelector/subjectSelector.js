import { Subjects } from '/imports/api/subjects/subjects.js';

import './subjectSelector.html';

Template.subjectSelector.onCreated(function subjectSelectorOnCreated() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.subjectSelector.helpers({
    subjects: function() {
        return Subjects.find({}, { sort: { name: 1 } });
    }
});

Template.subjectSelector.events({
    'click .subjects': function(event) {
        $('#chosen-subject').text(this.name);
        $('#chosen-subject').attr('data-id', this._id);
    }
});

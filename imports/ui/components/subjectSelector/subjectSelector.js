import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Subjects } from '/imports/api/subjects/subjects.js';

import './subjectSelector.html';

Template.subjectSelector.onCreated(function subjectSelectorOnCreated() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.subjectSelector.helpers({
    subjects() {
        return Subjects.find({}, { sort: { name: 1 } });
    }
});

Template.subjectSelector.events({
    'click .subjects'() {
        $('#chosen-subject').text(this.name);
        $('#chosen-subject').attr('data-id', this._id);
    }
});

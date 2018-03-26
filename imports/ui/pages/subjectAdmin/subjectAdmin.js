import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import { $ } from 'meteor/jquery';
import { Subjects } from '/imports/api/subjects/subjects.js';

import './subjectAdmin.html';

Template.addSubject.events({
    'click button#saveNewSubject'() {
        Meteor.call(
            'subjects.insert',
            {
                subject: $('#newSubject')
                    .val()
                    .trim()
            },
            function(error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                } else {
                    $('#newSubject').val('');
                }
            }
        );
    }
});

Template.subjectsTable.onCreated(function subjectsTableOnCreated() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.subjectsTable.helpers({
    subjects() {
        return Subjects.find({}, { sort: { name: 1 } });
    }
});

Template.subjectsTable.events({
    'click button.deleteSubject'() {
        Meteor.call(
            'subjects.remove',
            {
                subjectId: this._id
            },
            function(error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    }
});

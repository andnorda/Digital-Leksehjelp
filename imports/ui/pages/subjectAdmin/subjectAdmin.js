import { Subjects } from '/imports/api/subjects/subjects.js';

import './subjectAdmin.html';

Template.addSubject.events({
    'click button#saveNewSubject': function() {
        Meteor.call(
            'subjects.insert',
            {
                subject: $('#newSubject')
                    .val()
                    .trim()
            },
            function(error, result) {
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
    subjects: function() {
        return Subjects.find({}, { sort: { name: 1 } });
    }
});

Template.subjectsTable.events({
    'click button.deleteSubject': function() {
        Meteor.call(
            'subjects.remove',
            {
                subjectId: this._id
            },
            function(error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    }
});

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

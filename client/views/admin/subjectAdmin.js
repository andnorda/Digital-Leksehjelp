Template.addSubject.events({
    'click button#saveNewSubject' : function () {
        Meteor.call('insertNewSubject',
            {
                subject: $('#newSubject').val().trim()
            },
            function (error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                } else {
                    $('#newSubject').val("");
                }
            });
    }
});

Template.subjectsTable.helpers({
    subjects: function () {
        return Subjects.find({});
    }
});

Template.subjectsTable.events({
    'click button.deleteSubject' : function () {
        Meteor.call('removeSubject',
            {
                subjectId: this._id
            },
            function (error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            });
    }
});

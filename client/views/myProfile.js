Template.mySubjectsSelector.rendered = function () {
    $('#mySubjects')
        .select2({
            width: "300px",
            multiple: true,
            minimumInputLength: 3,
            query: function(query) {
                var data = { results: []};
                data.results = (Subjects.find({ name: new RegExp(query.term, "i")})
                    .fetch()).map(function(subject) {
                        return {
                            id: subject._id + "-" + subject.name,
                            text: subject.name
                        };
                });
                return query.callback(data);
              }
        });
};

Template.mySubjectsSelector.events({
    'click #saveMySubjects' : function () {
        var subjectIdAndNameArray = $('#mySubjects').val().split(',');
        var subjectsArray = [];
        var tempArr = [];
        for (var i = 0; i < subjectIdAndNameArray.length; i++) {
            tempArr = subjectIdAndNameArray[i].split('-');
            subjectsArray.push({ subjectId: tempArr[0], subjectName: tempArr[1] });
        };

        Meteor.call('updateMySubjects',
            {
                subjects: subjectsArray
            },
            function (error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            });

        $('#mySubjects').select2('val', '');
    }
});

Template.mySubjectsTable.mySubjects = function () {
    if(Meteor.user()) {
        return Meteor.user().profile.subjects;
    }
    return null;
};

Template.mySubjectsTable.events({
    'click button.removeSubjectFromMyProfile' : function () {
        Meteor.call('removeSubjectFromMyProfile',
            {
                subject: this
            },
            function (error, result) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            });
    }
});

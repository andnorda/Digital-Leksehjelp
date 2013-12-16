Template.mySubjectsSelector.rendered = function () {
    console.log("mySubjectsSelector is rendered!");
    // $('#mySubjects')
    //     .select2({
    //         width: "300px"
    //     });

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
                            id: subject.name,
                            text: subject.name
                        };
                });
                return query.callback(data);
              }
        });
};

// Template.mySubjectsSelector.subjects = function () {
//     console.log("Fetching subjects...");
//     return Subjects.find({}).fetch();
// };

Template.mySubjectsSelector.events({
    'click #saveMySubjects' : function () {
        console.log("We need to save the subjects here");
        console.log("Values:", $('#mySubjects').val());
        console.log("Logged in user", Meteor.user()._id);
        Meteor.call('updateMySubjects',
            {
                subjects: $('#mySubjects').val().split(',')
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
    return Meteor.user().profile.subjects;
};

Template.addSubject.events({
    'click #saveNewSubject' : function () {
        console.log("Saving new subject");
        console.log("New subject: ", $('#newSubject').val().trim());
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

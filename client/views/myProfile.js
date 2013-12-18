Template.mySubjectsSelector.rendered = function () {
    console.log("mySubjectsSelector is rendered!");

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

Template.mySubjectsSelector.events({
    'click #saveMySubjects' : function () {
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

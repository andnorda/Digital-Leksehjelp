Template.subjectSelector.events({
    'click .subjects' : function (event) {
        if(!$(event.target).hasClass("disabled-li")) {
            $('#chosen-subject').text(this.name);
        }
    },
});

Template.gradeSelector.events({
    'click .grades' : function () {
        $('#chosen-grade').text(this);
    }
});

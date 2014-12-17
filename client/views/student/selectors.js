Template.subjectSelector.events({
    'click .subjects' : function (event) {
        $('#chosen-subject').text(this.name);
        $('#chosen-subject').attr('data-id', this._id);
    },
});

Template.gradeSelector.events({
    'click .grades' : function () {
        $('#chosen-grade').text(this);
    }
});

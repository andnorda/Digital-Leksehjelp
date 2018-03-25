import './subjectSelector.html';

Template.subjectSelector.events({
    'click .subjects': function(event) {
        $('#chosen-subject').text(this.name);
        $('#chosen-subject').attr('data-id', this._id);
    }
});

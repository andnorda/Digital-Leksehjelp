import './gradeSelector.html';

Template.gradeSelector.events({
    'click .grades': function() {
        $('#chosen-grade').text(this);
    }
});

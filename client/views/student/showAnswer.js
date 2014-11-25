Template.showAnswer.helpers({
    subjectName: function(subjectId) {
        var subject = Subjects.findOne({ _id: subjectId });
        return (subject) ? subject.name : "Ukjent fag";
    }
});

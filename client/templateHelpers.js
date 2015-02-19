validationErrorDep = new Deps.Dependency;
validationError = [];

Template.registerHelper('isGreaterThanZero', function(value) {
  if(value > 0) {
    return true;
  }
  return false
});

Template.registerHelper('not', function(value) {
    return !value;
});

Template.registerHelper('eq', function(value1, value2) {
    return value1 === value2;
});

Template.registerHelper('globalRoles', function(block) {
    return ROLES;
});

Template.registerHelper('optionsSelected', function(values, defaultValue) {
    var buffer = "";
    if (Array.isArray(values)) {
        // TODO(martin): If needed, treat as array.
    } else {
        // Treat as object
        for (var value in values) {
            var option = '';
            if (values[value] === defaultValue) {
                buffer += '<option selected>' + values[value] + '</option>';
            } else {
                buffer += '<option>' + values[value] + '</option>';
            };
        }
    }
    return new Spacebars.SafeString(buffer);
});

Template.registerHelper('transformNewline', function(text) {
    if (text) {
        return new Spacebars.SafeString(text.replace(/(\r\n|\n|\r)/g, "<br>"));
    }
});

Template.registerHelper('serviceIsOpen', function () {
    var serviceStatusArray = Config.find({ name: "serviceStatus" }).fetch();
        if (serviceStatusArray.length > 0) {
            return serviceStatusArray[0].open;
        }
        return false;
    }
);

Template.registerHelper('trim', function(str, stopIndex) {
    if (str.length < stopIndex) {
        return str;
    }
    return str.substring(0, stopIndex) + "...";
});

Template.registerHelper('titleOrTrimmedQuestion', function(question, stopIndex) {
    if (question.title && question.title.length > 1) {
      return question.title;
    }
    if (question.question.length < stopIndex) {
        return question.question;
    }
    return question.question.substring(0, stopIndex) + "...";
});

Template.registerHelper('grades', function() {
    return GRADES;
});

Template.registerHelper('subjects', function() {
    return Subjects.find({}, {sort: {name: 1}});
});

Template.registerHelper('subjectName', function(subjectId) {
    var subject = Subjects.findOne({ _id: subjectId });
    return (subject) ? subject.name : "Ukjent fag";
});

Template.registerHelper('username', function(userId) {
    if (Meteor.userId()) {
        var user = Meteor.users.findOne(userId);
        return (user) ? user.username : "";
    }
});

Template.registerHelper('fromNow', function(date) {
    if (date) {
        return moment(date).fromNow();
    }
});

Template.registerHelper('prettifyDate', function(date) {
    if (date) {
        return moment(date).format("D.M.YYYY HH:mm");
    }
});

Template.registerHelper('validationError', function(errorType){
    validationErrorDep.depend();
    if (validationError && validationError.indexOf(errorType) > -1) {
        if(errorType === 'attachmentError'){
            return "dl-attachment-error";
        }
        return "validation-error";
    }
});

Template.registerHelper('isNotMe', function(userId) {
    return Meteor.userId() && Meteor.userId() != userId;
});

Template.registerHelper('subjectList', function (subjects) {
    if (!subjects) {
        return "";
    }

    var subjectNames = subjects.map(function(subject) {
        return subject.subjectName;
    });

    if (subjectNames.length > 1) {
        var subjectNamesStr = "";
        for (var i = 0; i < subjectNames.length - 1; i++) {
            subjectNamesStr += subjectNames[i] + ", ";
        }
        return subjectNamesStr.substring(0, subjectNamesStr.length - 2) +
            " og " + subjectNames[subjectNames.length-1];
    } else {
        return subjectNames.join("");
    }
});

Template.registerHelper('slugOrId', function(question) {
    return question.slug || question._id;
});

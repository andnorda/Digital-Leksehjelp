StudentSessionsSchema = new SimpleSchema({
    subject: {
        type: String
    },
    grade: {
        type: String
    },
    videoConferenceUrl: {
        type: String,
        regEx: SimpleSchema.RegEx.Url
    },
    state: {
        type: String,
        allowedValues: Object.keys(STUDENT_SESSION_STATE).map(function(key){ return STUDENT_SESSION_STATE[key]; })
    },
    queueNr: {
        type: Number
    },
    tutor: {
        type: String,
        optional: true
    }
});

StudentQueueSchema = new SimpleSchema({
    queueNr: {
        type: Number
    },
    subject: {
        type: String
    }
});

SubjectsSchema = new SimpleSchema({
    name: {
        type: String
    },
    availableVolunteers: {
        type: [String]
    },
    humanReadableId: {
        type: String,
        index: true
    }
});

QuestionsSchema = new SimpleSchema({
    question: {
        type: String
    },
    questionDate: {
        type: Date
    },
    subjectId: {
        type: String
    },
    grade: {
        type: String,
        allowedValues: GRADES.concat(['Ukjent'])
    },
    studentEmail: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        optional: true
    },
    title: {
        type: String,
        optional: true
    },
    answer: {
        type: String,
        optional: true
    },
    answerDate: {
        type: Date,
        optional: true
    },
    answeredBy: {
        type: String,
        optional: true
    },
    verifiedBy: {
        type: String,
        optional: true
    },
    publishedBy: {
        type: String,
        optional: true
    },
    lastUpdatedBy: {
        type: String,
        optional: true
    },
    lastUpdatedDate: {
        type: Date,
        optional: true
    },
    editing: {
        type: [String],
        optional: true
    }
});

StudentSessions.attachSchema(StudentSessionsSchema);
StudentQueue.attachSchema(StudentQueueSchema);
Subjects.attachSchema(SubjectsSchema);
Questions.attachSchema(QuestionsSchema);

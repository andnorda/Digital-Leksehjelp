Meteor.methods({
    updateUserRole: function (options) {
        check(options.userId, String);
        check(options.role, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        if (user.profile.role === ROLES.ADMIN) {
            var currentRole = Meteor.users.find({_id: options.userId}).fetch()[0].profile.role;
            if (currentRole === ROLES.ADMIN && options.role !== ROLES.ADMIN) {
                var nrOfAdminsLeft = Meteor.users.find({ 'profile.role': ROLES.ADMIN }).fetch();
                if (nrOfAdminsLeft.length === 1) {
                    throw new Meteor.Error(403, "This user is the last administrator.");
                }
            }
            var updateDoc = {
                $set: { 'profile.role': options.role}
            };
            return Meteor.users.update({_id: options.userId}, updateDoc);
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    removeUser: function (options) {
        check(options.userId, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        if (user.profile.role === ROLES.ADMIN) {
            var currentRole = Meteor.users.find({_id: options.userId}).fetch()[0].profile.role;
            if (currentRole === ROLES.ADMIN) {
                var nrOfAdminsLeft = Meteor.users.find({ 'profile.role': ROLES.ADMIN }).fetch();
                if (nrOfAdminsLeft.length === 1) {
                    throw new Meteor.Error(403, "This user is the last administrator.");
                }
            }
            return Meteor.users.remove({_id: options.userId});
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    toggleAllowVideohelp: function (options) {
        check(options.userId, String);

        var user = Meteor.users.findOne({_id: Meteor.userId()});
        if (!user) { throw new Meteor.Error(401, "You are not logged in."); };

        if (user.profile.role === ROLES.ADMIN) {
            var otherUser = Meteor.users.findOne({_id: options.userId});
            if (!user) { throw new Meteor.Error(404, "User with id " + options.userId + " does not exist."); }

            var currentAllowVideohelp = otherUser.profile.allowVideohelp;
            var newAllowVideohelp = !currentAllowVideohelp;

            Meteor.users.update(
                { _id: otherUser._id },
                {
                    $set: {
                        'profile.allowVideohelp' : newAllowVideohelp
                    }
                });

            if (newAllowVideohelp) {
                var subjectIds = otherUser.profile.subjects.map(function (subject) {
                    return subject.subjectId;
                });

                for (var i = 0; i < subjectIds.length; i++) {
                    Subjects.update(
                        { _id: subjectIds[i] },
                        { $addToSet: { availableVolunteers: otherUser._id } });
                }
            } else {
                Subjects.update(
                    {},
                    { $pull: { availableVolunteers: otherUser._id } },
                    { multi: true });
            }
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    setSubjectsAvailable: function (options, setUnavailable) {
        //TODO(martin): subjectName is not used..
        check(options.subjects, [ { subjectId: String, subjectName: String } ]);

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        Meteor.users.update(
            { _id: this.userId },
            {
                $set: {
                    'profile.setSubjectsAvailable' : false
                }
            });

        var updateDoc = {};
        if (setUnavailable) {
            updateDoc = { $pull: { availableVolunteers: this.userId } };
        } else {
            if (user.allowVideohelp || user.profile.role === ROLES.ADMIN) {
                updateDoc = { $addToSet: { availableVolunteers: this.userId } };
            } else {
                return;
            }
        }

        /*
            TODO(martin):
            Performance could be better. Bulk update if possible.
            Now subjects template is rerendering per iteration
        */
        for (var i = 0; i < options.subjects.length; i++) {
            Subjects.update(
                { _id: options.subjects[i].subjectId },
                updateDoc,
                function (error, nrOfDocsAffected) {
                    if (error) {
                        throw new Meteor.Error(500, "Server error, please try again.");
                    }
                });
        };
    },

    removeSubjectFromMyProfile: function (options) {
        check(options.subject, { subjectId: String, subjectName: String });

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };
        var userId = this.userId;

        /*
         * Setting the old subjects unavailable
         */
        var setSubjectsUnavailable = true;
        Meteor.call(
            'setSubjectsAvailable',
            { subjects: Meteor.users.find(this.userId).fetch()[0].profile.subjects },
            setSubjectsUnavailable,
            function (error) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
                Meteor.users.update({
                    _id: userId
                },
                {
                    $pull: { 'profile.subjects': { subjectId: options.subject.subjectId }},
                    $set: {
                            'profile.setSubjectsAvailable' : true
                        }
                }, function (error) {
                    if (error) {
                        throw new Meteor.Error(500, error.message);
                    }
                });
            });
    },

    updateMySubjects: function (options) {
        check(options.subjects, [ { subjectId: String, subjectName: String } ]);

        var user = Meteor.users.findOne(this.userId);
        var oldSubjects = user.profile.subjects.slice();
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };
        var userId = this.userId;

        /*
         * Setting the old subjects unavailable
         */
        var setSubjectsUnavailable = true;
        Meteor.call(
            'setSubjectsAvailable',
            { subjects: oldSubjects },
            setSubjectsUnavailable,
            function (error) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
                checkSubject:
                    for (var j = 0; j < options.subjects.length; j++) {
                        for (var i = 0; i < oldSubjects.length; i++) {
                            if (oldSubjects[i].subjectId === options.subjects[j].subjectId) {
                                continue checkSubject;
                            }
                        }
                        oldSubjects.push(options.subjects[j]);
                    }

                /*
                 * Saving and marking the newly chosen subjects to be available
                 */
                Meteor.users.update(
                    { _id: userId },
                    {
                        $set: {
                                'profile.subjects' : oldSubjects,
                                'profile.setSubjectsAvailable' : true
                            }
                    });
            });
    },

    insertNewSubject: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };
        if (user.profile.role !== ROLES.ADMIN) { throw new Meteor.Error(403, "You are not allowed to access this."); }

        var humanReadableId = DigitalLeksehjelp.urlify(options.subject);

        Subjects.insert(
            {
                name: options.subject,
                availableVolunteers: [],
                humanReadableId: humanReadableId
            },
            function (error, id) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
            });
    },

    removeSubject: function (options) {
        check(options.subjectId, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};
        if (user.profile.role !== ROLES.ADMIN) { throw new Meteor.Error(403, "You are not allowed to access this."); }

        Subjects.remove(
            { _id: options.subjectId },
            function (error, id) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
            });
    },

    upsertOpeningHours: function (options) {
        check(options.newOpeningHours, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        if (user.profile.role === ROLES.ADMIN) {
            Config.upsert({ name: "openingHours" }, {$set: { "text": options.newOpeningHours }});
        }
    },

    upsertServiceStatus: function (options) {
        check(options.newServiceStatus, Boolean);

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        var updateDoc;
        if (user.profile.role === ROLES.ADMIN) {
            updateDoc = { $set: { "open": options.newServiceStatus }};
        } else if (user.profile.role === ROLES.TUTOR && user.profile.allowVideohelp && options.newServiceStatus === true) {
            updateDoc = { $set: { "open": options.newServiceStatus }};
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }

        Config.upsert({ name: "serviceStatus" }, updateDoc);
    },

    removeSession: function (options) {
        check(options.sessionId, String);

        StudentSessions.remove({ _id: options.sessionId });
    },

    setSessionState: function (options) {
        check(options.sessionId, String);

        var updateDoc;
        if (!options.tutor) {
            updateDoc = { $set: { state: options.state } };
        } else {
            updateDoc = { $set: { state: options.state, tutor: options.tutor } };
        }

        StudentSessions.update(
            { _id: options.sessionId },
            updateDoc
        );
    },

    askQuestion: function (options) {
        check(options.subjectId, String);
        check(options.grade, String);
        check(options.studentEmail, String);
        check(options.attachmentUrl, Match.Optional(String));
        if (options.studentEmail.length < 1) { throw new Meteor.Error(400, "Email address must contain at least one character"); }
        if (options.subjectId === "default") { throw new Meteor.Error(400, "Subject id can not be \"default\""); }
        if (options.grade === "default") { throw new Meteor.Error(400, "Grade can not be \"default\""); }

        var question = {
            subjectId: options.subjectId,
            grade: options.grade,
            question: options.question,
            questionDate: new Date(),
            studentEmail: options.studentEmail
        };

        if (options.attachmentUrl) {
            question['attachmentUrl'] = options.attachmentUrl;
        }

        Questions.insert(question,
            function (error) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
            });
    },

    answerQuestion: function (options) {
        check(options.questionId, String);
        check(options.title, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in."); }

        var question = Questions.findOne({ _id: options.questionId });
        if (!question) { throw new Meteor.Error(404, "Question with id " + options.questionId + " does not exist."); }

        var updateDoc = { $set: {
            question: options.question,
            answer: options.answer,
            title: options.title,
            lastUpdatedBy: this.userId,
            lastUpdatedDate: new Date()
        }}

        if (!question.answeredBy) {
            updateDoc['$set']['answeredBy'] = this.userId;
            updateDoc['$set']['answerDate'] = new Date();
        }

        if (options.publishAnswer) {
            updateDoc['$set']['publishedBy'] = this.userId;
        } else {
            updateDoc['$unset'] = { publishedBy: "" };
        }

        if (options.answerAttachmentUrl) {
            updateDoc['$set']['answerAttachmentUrl'] = options.answerAttachmentUrl;
        }

        if (Meteor.isServer) {
            if (options.title && options.title.length > 0 && !question.slug) {
                updateDoc['$set']['slug'] = DigitalLeksehjelp.generateUniqueSlug(question.title);
            }
        }

        Questions.update(
            { _id: options.questionId },
            updateDoc
            );
    },

    verifyAnswer: function (options) {
        check(options.questionId, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        var question = Questions.findOne({ _id: options.questionId });
        if (question.lastUpdatedBy === this.userId) {
            throw new Meteor.Error(403, "You are not allowed to verify this answer because you were the last one to edit it.");
        }

        Questions.update(
            { _id: options.questionId },
            { $set: {
                verifiedBy: this.userId
            } }
            );

        if (question.studentEmail) {
            Meteor.call('sendAnswerEmail', question);
        }
    },

    setEditing: function (options) {
        check(options, {
            questionId: String,
            editing: Boolean
        });

        if (!this.userId) { throw new Meteor.Error(401, "You are not logged in.")};

        if (options.editing) {
            Questions.update({ _id: options.questionId }, { $addToSet: { editing: this.userId }});
        } else {
            Questions.update({ _id: options.questionId }, { $pull: { editing: this.userId }});
        }
    },

    setProfilePictureUrl: function (url) {
        check(url, String);
        if (!this.userId) { throw new Meteor.Error(401, "You are not logged in.") };

        Meteor.users.update(
            { _id: this.userId },
            {
                $set: {
                    'profile.pictureUrl' : url
                }
            });
    }
});

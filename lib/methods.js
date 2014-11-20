Meteor.methods({
    updateUserRole: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.userId, String);
        check(options.role, String);

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
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.userId, String);

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

    setSubjectsAvailable: function (options, setUnavailable) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        //TODO(martin): subjectName is not used..
        check(options.subjects, [ { subjectId: String, subjectName: String } ]);

        Meteor.users.update(
            { _id: this.userId },
            {
                $set: {
                    'profile.setSubjectsAvailable' : false
                }
            });

        var updateDoc;
        if (setUnavailable) {
            updateDoc = { $pull: { availableVolunteers: this.userId } };
        } else {
            updateDoc = { $addToSet: { availableVolunteers: this.userId } };
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
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };
        var userId = this.userId;
        check(options.subject, { subjectId: String, subjectName: String });

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
        var user = Meteor.users.findOne(this.userId);
        var oldSubjects = user.profile.subjects.slice();
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };
        var userId = this.userId;

        check(options.subjects, [ { subjectId: String, subjectName: String } ]);

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

        check(options.subject, String);

        Subjects.insert(
            {
                name: options.subject,
                availableVolunteers: []
            },
            function (error, id) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
            });
    },

    removeSubject: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};
        if (user.profile.role !== ROLES.ADMIN) { throw new Meteor.Error(403, "You are not allowed to access this."); }

        check(options.subjectId, String);

        Subjects.remove(
            { _id: options.subjectId },
            function (error, id) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
            });
    },

    upsertOpeningHours: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        check(options.newOpeningHours, String);

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
        } else if (user.profile.role === ROLES.TUTOR && options.newServiceStatus === true) {
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
        check(options, {
            sessionId: String,
            state: String,
            tutor: Match.Optional(String)
        });

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
        check(options, {
            subjectId: String,
            grade: String,
            question: String,
            email: String
        });

        var question = {
            subjectId: options.subjectId,
            grade: options.grade,
            question: options.question,
            email: options.email,
            published: false,
            answer: null
        };

        Questions.insert(question,
            function (error) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
            });
    }
});

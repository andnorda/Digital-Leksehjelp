Meteor.methods({
    updateUser: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.userId, String);
        check(options.role, String);

        if (user.profile.role === ROLES.ADMIN) {
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
            return Meteor.users.remove({_id: options.userId});
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    userLoggedOut: function (options) {
        check(options.userId, String);

        var user = Meteor.users.findOne(options.userId);

        var setSubjectsAvailable = user.profile.setSubjectsAvailable;
        if(!setSubjectsAvailable) {
            for (var i = 0; i < user.profile.subjects.length; i++) {
                Subjects.update(
                    { _id: user.profile.subjects[i].subjectId },
                    {
                        $inc: { availableVolunteers: -1 }
                    },
                    function (error, id) {
                        if (error) {
                            throw new Meteor.Error(500, "Server error, please try again.");
                        }
                    });
            };

            Meteor.users.update(user,
                {
                    $set: {
                            'profile.setSubjectsAvailable' : true
                        }
                });
        }
    },

    setSubjectsAvailable: function (options, setUnavailable) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        Meteor.users.update(user,
            {
                $set: {
                    'profile.setSubjectsAvailable' : false
                }
            }, function (error, data) {
                var valueToIncreaseWith;
                if (setUnavailable) {
                    valueToIncreaseWith = -1;
                } else {
                    valueToIncreaseWith = 1;
                }
                //TODO(martin): subjectName is not used..
                check(options.subjects, [ { subjectId: String, subjectName: String } ]);

                /*
                    TODO(martin):
                    Performance could be better. Bulk update if possible.
                    Now subjects template is rerendering per iteration
                */
                for (var i = 0; i < options.subjects.length; i++) {
                    Subjects.update(
                        { _id: options.subjects[i].subjectId },
                        {
                            $inc: { availableVolunteers: valueToIncreaseWith }
                        },
                        function (error, id) {
                            if (error) {
                                throw new Meteor.Error(500, "Server error, please try again.");
                            }
                        });
                };
            });
    },

    logoutUser: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.userId, String);

        if (user.profile.role === ROLES.ADMIN) {
            Meteor.users.update({_id: options.userId}, { $set: { 'services.resume.loginTokens' : [], 'profile.forceLogOut': true }});
        } else {
            throw new Meteor.Error(403, "You are not allowed to access this.");
        }
    },

    updateMySubjects: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.subjects, [ { subjectId: String, subjectName: String } ]);
        var setSubjectsUnavailable = true;

        Meteor.call(
            'setSubjectsAvailable',
            { subjects: user.profile.subjects },
            setSubjectsUnavailable);

        Meteor.users.update(
            {_id: this.userId},
            {
                $set: {
                        'profile.subjects' : options.subjects,
                        'profile.setSubjectsAvailable' : true
                    }
            });
    },

    insertNewSubject: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.") };

        check(options.subject, String);

        Subjects.insert(
            {
                name: options.subject,
                availableVolunteers: 0
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

        check(options.subjectId, String);

        Subjects.remove(
            { _id: options.subjectId },
            function (error, id) {
                if (error) {
                    throw new Meteor.Error(500, "Server error, please try again.");
                }
            });
    },

    resetForceLogOut: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        Meteor.users.update(user,
            { $set: { 'profile.forceLogOut': false }});
    },

    upsertOpeningHours: function (options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) { throw new Meteor.Error(401, "You are not logged in.")};

        check(options.newOpeningHours, String);

        if (user.profile.role === ROLES.ADMIN) {
            Config.upsert({ name: "openingHours" }, {$set: { "text": options.newOpeningHours }});
        }
    }
});

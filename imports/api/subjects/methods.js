import { Subjects } from './subjects.js';

import { ROLES } from '/imports/constants';

Meteor.methods({
    setSubjectsAvailable: function(options, setUnavailable) {
        //TODO(martin): subjectName is not used..
        check(options.subjects, [{ subjectId: String, subjectName: String }]);

        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }

        Meteor.users.update(
            { _id: this.userId },
            {
                $set: {
                    'profile.setSubjectsAvailable': false
                }
            }
        );

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
                function(error, nrOfDocsAffected) {
                    if (error) {
                        throw new Meteor.Error(
                            500,
                            'Server error, please try again.'
                        );
                    }
                }
            );
        }
    },

    removeSubjectFromMyProfile: function(options) {
        check(options.subject, { subjectId: String, subjectName: String });

        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        var userId = this.userId;

        /*
         * Setting the old subjects unavailable
         */
        var setSubjectsUnavailable = true;
        Meteor.call(
            'setSubjectsAvailable',
            {
                subjects: Meteor.users.find(this.userId).fetch()[0].profile
                    .subjects
            },
            setSubjectsUnavailable,
            function(error) {
                if (error) {
                    throw new Meteor.Error(
                        500,
                        'Server error, please try again.'
                    );
                }
                Meteor.users.update(
                    {
                        _id: userId
                    },
                    {
                        $pull: {
                            'profile.subjects': {
                                subjectId: options.subject.subjectId
                            }
                        },
                        $set: {
                            'profile.setSubjectsAvailable': true
                        }
                    },
                    function(error) {
                        if (error) {
                            throw new Meteor.Error(500, error.message);
                        }
                    }
                );
            }
        );
    },

    updateMySubjects: function(options) {
        check(options.subjects, [{ subjectId: String, subjectName: String }]);

        var user = Meteor.users.findOne(this.userId);
        var oldSubjects = user.profile.subjects.slice();
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        var userId = this.userId;

        /*
         * Setting the old subjects unavailable
         */
        var setSubjectsUnavailable = true;
        Meteor.call(
            'setSubjectsAvailable',
            { subjects: oldSubjects },
            setSubjectsUnavailable,
            function(error) {
                if (error) {
                    throw new Meteor.Error(
                        500,
                        'Server error, please try again.'
                    );
                }
                checkSubject: for (
                    var j = 0;
                    j < options.subjects.length;
                    j++
                ) {
                    for (var i = 0; i < oldSubjects.length; i++) {
                        if (
                            oldSubjects[i].subjectId ===
                            options.subjects[j].subjectId
                        ) {
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
                            'profile.subjects': oldSubjects,
                            'profile.setSubjectsAvailable': true
                        }
                    }
                );
            }
        );
    },

    insertNewSubject: function(options) {
        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ROLES.ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        var humanReadableId = DigitalLeksehjelp.urlify(options.subject);

        Subjects.insert(
            {
                name: options.subject,
                availableVolunteers: [],
                humanReadableId: humanReadableId
            },
            function(error, id) {
                if (error) {
                    throw new Meteor.Error(
                        500,
                        'Server error, please try again.'
                    );
                }
            }
        );
    },

    removeSubject: function(options) {
        check(options.subjectId, String);

        var user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ROLES.ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Subjects.remove({ _id: options.subjectId }, function(error, id) {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            }
        });
    }
});

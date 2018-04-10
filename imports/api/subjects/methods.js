import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ROLES } from '/imports/constants.js';
import { urlify } from '/imports/utils.js';
import { Subjects } from './subjects.js';

Meteor.methods({
    'subjects.setAvailable'(options, setUnavailable) {
        // TODO(martin): subjectName is not used..
        check(options.subjects, [{ subjectId: String, subjectName: String }]);

        const user = Meteor.users.findOne(this.userId);
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

        let updateDoc = {};
        if (setUnavailable) {
            updateDoc = { $pull: { availableVolunteers: this.userId } };
        } else if (user.allowVideohelp || user.profile.role === ROLES.ADMIN) {
            updateDoc = { $addToSet: { availableVolunteers: this.userId } };
        } else {
            return;
        }

        /*
            TODO(martin):
            Performance could be better. Bulk update if possible.
            Now subjects template is rerendering per iteration
        */
        for (let i = 0; i < options.subjects.length; i += 1) {
            Subjects.update(
                { _id: options.subjects[i].subjectId },
                updateDoc,
                (error, nrOfDocsAffected) => {
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

    'subjects.removeFromMyProfile'(options) {
        check(options.subject, { subjectId: String, subjectName: String });

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        const userId = this.userId;

        /*
         * Setting the old subjects unavailable
         */
        const setSubjectsUnavailable = true;
        Meteor.call(
            'subjects.setAvailable',
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
                    function(err) {
                        if (err) {
                            throw new Meteor.Error(500, err.message);
                        }
                    }
                );
            }
        );
    },

    'subjects.update'(options) {
        check(options.subjects, [{ subjectId: String, subjectName: String }]);

        const user = Meteor.users.findOne(this.userId);
        const oldSubjects = user.profile.subjects.slice();
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        const userId = this.userId;

        /*
         * Setting the old subjects unavailable
         */
        const setSubjectsUnavailable = true;
        Meteor.call(
            'subjects.setAvailable',
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
                    let j = 0;
                    j < options.subjects.length;
                    j++
                ) {
                    for (let i = 0; i < oldSubjects.length; i++) {
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

    'subjects.insert'(options) {
        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ROLES.ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Subjects.insert(
            {
                name: options.subject,
                availableVolunteers: []
            },
            function(error) {
                if (error) {
                    throw new Meteor.Error(
                        500,
                        'Server error, please try again.'
                    );
                }
            }
        );
    },

    'subjects.remove'(options) {
        check(options.subjectId, String);

        const user = Meteor.users.findOne(this.userId);
        if (!user) {
            throw new Meteor.Error(401, 'You are not logged in.');
        }
        if (user.profile.role !== ROLES.ADMIN) {
            throw new Meteor.Error(403, 'You are not allowed to access this.');
        }

        Subjects.remove({ _id: options.subjectId }, function(error) {
            if (error) {
                throw new Meteor.Error(500, 'Server error, please try again.');
            }
        });
    }
});

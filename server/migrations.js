import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';
import { isBefore } from 'date-fns';
import { Subjects } from '../imports/api/subjects/subjects.js';
import { Questions } from '../imports/api/questions/questions.js';

Migrations.add({
    version: 1,
    name:
        'Move subjects out of profile, and reference them by name instead of id',
    up() {
        Meteor.users.find().forEach(user => {
            const subjects = (user.profile.subjects || [])
                .map(({ subjectId }) => Subjects.findOne(subjectId))
                .filter(s => s)
                .map(subject => subject.name);
            Meteor.users.update(user._id, { $set: { subjects } });
        });
    },
    down() {
        Meteor.users.find().forEach(user => {
            const subjects = (user.subjects || [])
                .map(name => Subjects.findOne({ name }))
                .filter(s => s)
                .map(subject => subject._id);
            Meteor.users.update(user._id, {
                $set: { subjects: subjects }
            });
        });
    }
});

Migrations.add({
    version: 2,
    name: 'Migrate question subjectIds to subject name',
    up() {
        Questions.find().forEach(question => {
            const subjectObject = Subjects.findOne(question.subjectId);
            const subject = subjectObject
                ? subjectObject.name || 'Ukjent fag'
                : 'Ukjent fag';
            Questions.update(question._id, {
                $set: { subject }
            });
        });
    },
    down() {}
});

Migrations.add({
    version: 3,
    name: 'Make question attachments an array',
    up() {
        Questions.find({ attachmentUrl: { $exists: true } }).forEach(
            question => {
                const split = question.attachmentUrl.split('/');
                const name = split[split.length - 1];
                Questions.update(question._id, {
                    $set: {
                        attachments: [{ name, url: question.attachmentUrl }]
                    }
                });
            }
        );
    },
    down() {}
});

Migrations.add({
    version: 4,
    name: 'Make answer attachments an array',
    up() {
        Questions.find({ answerAttachmentUrl: { $exists: true } }).forEach(
            question => {
                const split = question.answerAttachmentUrl.split('/');
                const name = split[split.length - 1];
                Questions.update(question._id, {
                    $set: {
                        answerAttachments: [
                            { name, url: question.answerAttachmentUrl }
                        ]
                    }
                });
            }
        );
    },
    down() {}
});

Migrations.add({
    version: 5,
    name: 'answerDate & answeredBy to editedBy array',
    up() {
        Questions.find({ answeredBy: { $exists: true } }).forEach(question => {
            Questions.update(question._id, {
                $set: {
                    editedBy: [
                        { id: question.answeredBy, date: question.answerDate }
                    ]
                }
            });
        });
    },
    down() {}
});

Migrations.add({
    version: 6,
    name: 'lastUpdatedDate & lastUpdatedBy to editedBy array',
    up() {
        Questions.find({ lastUpdatedBy: { $exists: true } }).forEach(
            question => {
                const edit = question.editedBy.find(
                    edit => edit.id === question.lastUpdatedBy
                );
                if (edit) {
                    if (isBefore(edit.date, question.lastUpdatedDate)) {
                        Questions.update(
                            {
                                _id: question._id,
                                'editedBy.id': question.lastUpdatedBy
                            },
                            {
                                $set: {
                                    'editedBy.$.date': question.lastUpdatedDate
                                }
                            }
                        );
                    }
                } else {
                    Questions.update(question._id, {
                        $push: {
                            editedBy: {
                                id: question.lastUpdatedBy,
                                date: question.lastUpdatedDate
                            }
                        }
                    });
                }
            }
        );
    },
    down() {}
});

Migrations.add({
    version: 7,
    name: 'Rename verifiedBy to approvedBy',
    up() {
        Questions.find({ verifiedBy: { $exists: true } }).forEach(question => {
            Questions.update(question._id, {
                $set: { approvedBy: question.verifiedBy }
            });
        });
    },
    down() {}
});

Migrations.add({
    version: 8,
    name: 'Empty editing array',
    up() {
        Questions.find({ editing: { $gt: [] } }).forEach(question => {
            Questions.update(question._id, {
                $set: { editing: [] }
            });
        });
    },
    down() {}
});

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { addWeeks } from 'date-fns';
import { Shifts } from '../shifts.js';

Meteor.publish('shifts.bySubjectName', function (subjectName, date) {
    check(date, String);
    check(subjectName, String);

    return Shifts.find({
        start: {
            $gt: new Date(date)
        },
        end: {
            $lt: addWeeks(new Date(date), 2)
        },
        subjects: {
            $elemMatch: {
                $eq: subjectName
            }
        }
    });
});

Meteor.publish('shifts.current', function (date) {
    check(date, String);

    return Shifts.find({
        start: { $lt: new Date(date) },
        end: { $gt: new Date(date) }
    });
});

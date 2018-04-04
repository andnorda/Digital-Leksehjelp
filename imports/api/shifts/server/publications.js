import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { addWeeks } from 'date-fns';
import { Shifts } from '../shifts.js';

Meteor.publish('shifts.bySubjectName', function(subjectName) {
    check(subjectName, String);

    return Shifts.find({
        start: {
            $gt: new Date()
        },
        end: {
            $lt: addWeeks(new Date(), 2)
        },
        subjects: {
            $elemMatch: {
                $eq: subjectName
            }
        }
    });
});

import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Shifts = new Mongo.Collection('shifts');

const ShiftsSchema = new SimpleSchema({
    start: {
        type: Date
    },
    end: {
        type: Date
    },
    subjects: {
        type: [String]
    }
});

Shifts.attachSchema(ShiftsSchema);

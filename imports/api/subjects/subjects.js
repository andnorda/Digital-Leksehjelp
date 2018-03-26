import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Subjects = new Mongo.Collection('subjects');

const SubjectsSchema = new SimpleSchema({
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

Subjects.attachSchema(SubjectsSchema);

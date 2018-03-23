import { Mongo } from 'meteor/mongo';

export const Subjects = new Mongo.Collection('subjects');

SubjectsSchema = new SimpleSchema({
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

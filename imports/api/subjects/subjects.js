import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Subjects = new Mongo.Collection('subjects');

const SubjectsSchema = new SimpleSchema({
    name: {
        type: String
    },
    videoChatCount: {
        type: Number,
        optional: true
    }
});

Subjects.attachSchema(SubjectsSchema);

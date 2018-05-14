import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Topics = new Mongo.Collection('topics');

const TopicsSchema = new SimpleSchema({
    name: {
        type: String
    },
    subjectId: {
        type: String
    }
});

Topics.attachSchema(TopicsSchema);

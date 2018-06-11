import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const HelpTopics = new Mongo.Collection('helpTopics');

const HelpTopicsSchema = new SimpleSchema({
    name: {
        type: String
    },
    chatCount: {
        type: Number,
        optional: true
    }
});

HelpTopics.attachSchema(HelpTopicsSchema);

import { Meteor } from 'meteor/meteor';
import { HelpTopics } from '../helpTopics.js';

Meteor.publish('helpTopics', function() {
    return HelpTopics.find({});
});

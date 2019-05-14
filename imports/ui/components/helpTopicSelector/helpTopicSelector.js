import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { HelpTopics } from '/imports/api/helpTopics/helpTopics.js';
import { Config } from '/imports/api/config/config.js';

import './helpTopicSelector.html';

Template.helpTopicSelector.onCreated(function() {
    this.autorun(() => {
        this.subscribe('helpTopics');
        this.subscribe('users.loggedIn');
    });
});

Template.helpTopicSelector.helpers({
    options() {
        return HelpTopics.find().map(({ name }) => name);
    },
    onChange() {
        return this.onChange;
    }
});

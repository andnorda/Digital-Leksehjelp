import { Template } from 'meteor/templating';
import { HelpTopics } from '/imports/api/helpTopics/helpTopics.js';

import './helpTopicSelector.html';

Template.helpTopicSelector.onCreated(function () {
    this.autorun(() => {
        this.subscribe('helpTopics');
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

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { HelpTopics } from '/imports/api/helpTopics/helpTopics.js';
import { Config } from '/imports/api/config/config.js';

import './helpTopicSelector.html';

const isAvailable = name => {
    const serviceStatus = Config.findOne({ name: 'serviceStatus' });
    if (serviceStatus && !serviceStatus.open) return true;
    return (
        Meteor.users
            .find({
                helpTopics: name,
                'status.online': true
            })
            .count() > 0
    );
};

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
    },
    sort() {
        return (a, b) => {
            const aAvailable = isAvailable(a);
            const bAvailable = isAvailable(b);
            if (bAvailable && !aAvailable) {
                return 1;
            } else if (!bAvailable && aAvailable) {
                return -1;
            } else {
                const helpTopicA = HelpTopics.findOne({ name: a });
                const helpTopicB = HelpTopics.findOne({ name: b });
                return (
                    (helpTopicB ? helpTopicB.videoChatCount || 0 : 0) -
                    (helpTopicA ? helpTopicA.videoChatCount || 0 : 0)
                );
            }
        };
    },
    isAvailable() {
        return isAvailable;
    }
});

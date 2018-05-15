import { Topics } from '/imports/api/topics/topics.js';
import '../select/select.js';
import '../tagList/tagList.js';

import './topicsInput.html';
import './topicsInput.less';

Template.topicsInput.onCreated(function() {
    this.autorun(() => {
        this.subscribe('topics.bySubject', Template.currentData().subject);
    });
});

Template.topicsInput.helpers({
    topics() {
        return Topics.find()
            .fetch()
            .map(topic => topic.name)
            .filter(topic => !this.value.includes(topic));
    },
    addTopic() {
        return this.addTopic;
    },
    removeTopic() {
        return this.removeTopic;
    },
    oneTag() {
        return this.value.length === 1;
    }
});

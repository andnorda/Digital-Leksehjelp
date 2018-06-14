import { Topics } from '/imports/api/topics/topics.js';
import { Subjects } from '/imports/api/subjects/subjects.js';
import '../select/select.js';
import '../tagList/tagList.js';

import './topicsInput.html';
import './topicsInput.less';

Template.topicsInput.onCreated(function() {
    this.autorun(() => {
        const subject = Template.currentData().subject;

        subject && this.subscribe('topics.bySubject', subject);
        this.subscribe('subjects');
    });
});

const topics = (subjectName, value) => {
    const subject = Subjects.findOne({ name: subjectName });
    if (!subject) return;

    return Topics.find({ subjectId: subject._id })
        .fetch()
        .map(topic => topic.name)
        .filter(topic => !value.includes(topic));
};

Template.topicsInput.helpers({
    shouldRender() {
        return (
            (topics(Template.currentData().subject, this.value) || []).length ||
            (this.value || []).length
        );
    },
    topics() {
        return topics(Template.currentData().subject, this.value) || [];
    },
    addTopic() {
        return this.addTopic;
    },
    removeTopic() {
        return this.removeTopic;
    },
    oneTag() {
        return this.value && this.value.length === 1;
    }
});

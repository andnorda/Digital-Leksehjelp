import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { HelpTopics } from '/imports/api/helpTopics/helpTopics.js';
import { Topics } from '/imports/api/topics/topics.js';
import '../../components/input/input.js';
import '../../components/button/button.js';

import './subjectAdmin.html';
import './subjectAdmin.less';

Template.addSubject.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.addSubject.helpers({
    subjectName() {
        return Template.instance().state.get('subjectName');
    },
    addSubjectDisabled() {
        return !Template.instance().state.get('subjectName');
    }
});

Template.addSubject.events({
    'input input[name="subjectName"]'(event) {
        Template.instance().state.set('subjectName', event.target.value);
    },
    'submit .add-subject-form'(event) {
        event.preventDefault();
        const state = Template.instance().state;
        const subjectName = state.get('subjectName');
        Meteor.call('subjects.insert', { subject: subjectName });
        state.set('subjectName', undefined);
    }
});

Template.addHelpTopic.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.addHelpTopic.helpers({
    helpTopicName() {
        return Template.instance().state.get('helpTopicName');
    },
    addHelpTopicDisabled() {
        return !Template.instance().state.get('helpTopicName');
    }
});

Template.addHelpTopic.events({
    'input input[name="helpTopicName"]'(event) {
        Template.instance().state.set('helpTopicName', event.target.value);
    },
    'submit .add-help-topic-form'(event) {
        event.preventDefault();
        const state = Template.instance().state;
        const helpTopicName = state.get('helpTopicName');
        Meteor.call('helpTopics.insert', helpTopicName);
        state.set('helpTopicName', undefined);
    }
});

Template.allSubjects.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.allSubjects.helpers({
    subjects() {
        return Subjects.find({}, { sort: { name: 1 } });
    }
});

Template.allHelpTopics.onCreated(function() {
    this.autorun(() => {
        this.subscribe('helpTopics');
    });
});

Template.allHelpTopics.helpers({
    helpTopics() {
        return HelpTopics.find({}, { sort: { name: 1 } });
    }
});

Template.subject.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.subject.helpers({
    isActive() {
        return Template.instance().state.get('active');
    },
    deleteSubject() {
        const id = this._id;
        return () => Meteor.call('subjects.remove', { subjectId: id });
    }
});

Template.subject.events({
    'click a.heading'(event) {
        event.preventDefault();
        const state = Template.instance().state;
        state.set('active', !state.get('active'));
    }
});

Template.helpTopic.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.helpTopic.helpers({
    isActive() {
        return Template.instance().state.get('active');
    },
    deleteHelpTopic() {
        const id = this._id;
        return () => Meteor.call('helpTopics.remove', id);
    }
});

Template.topics.onCreated(function() {
    this.autorun(() => {
        this.subscribe('topics.bySubjectId', Template.currentData()._id);
    });
});

Template.topics.helpers({
    topics() {
        return Topics.find({ subjectId: this._id }, { sort: { name: 1 } });
    }
});

Template.topic.helpers({
    deleteTopic() {
        const id = this._id;
        return () => Meteor.call('topics.remove', id);
    }
});

Template.addTopic.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.addTopic.helpers({
    topicName() {
        return Template.instance().state.get('topicName');
    },
    addTopicDisabled() {
        return !Template.instance().state.get('topicName');
    }
});

Template.addTopic.events({
    'input input[name="topicName"]'(event) {
        Template.instance().state.set('topicName', event.target.value);
    },
    'submit .add-topic-form'(event) {
        event.preventDefault();
        const state = Template.instance().state;
        const topicName = state.get('topicName');
        Meteor.call('topics.insert', { subjectId: this._id, name: topicName });
        state.set('topicName', undefined);
    }
});

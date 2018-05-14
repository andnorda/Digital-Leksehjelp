import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import { $ } from 'meteor/jquery';
import { Subjects } from '/imports/api/subjects/subjects.js';
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

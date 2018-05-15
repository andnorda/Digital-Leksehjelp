import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Subjects } from '/imports/api/subjects/subjects.js';
import '../../components/input/input.js';
import '../../components/select/select.js';
import '../../components/button/button.js';
import '../../components/tagList/tagList.js';

import './myProfile.html';
import './myProfile.less';

Template.myProfile.onCreated(function() {
    this.autorun(() => {
        this.subscribe('users.self');
        this.subscribe('subjects');
    });
});

Template.mySubjects.helpers({
    subjects() {
        return Subjects.find()
            .fetch()
            .filter(
                subject =>
                    !(Meteor.user().subjects || []).includes(subject.name)
            )
            .map(subject => subject.name);
    },
    mySubjects() {
        if (Meteor.user()) {
            return Meteor.user().subjects;
        }
        return null;
    },
    addSubject() {
        return subject => subject && Meteor.call('users.addSubject', subject);
    },
    removeSubject() {
        const subject = this.valueOf();
        return () => Meteor.call('users.removeSubject', subject);
    }
});

Template.editName.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.editName.helpers({
    name() {
        const name = Template.instance().state.get('name');
        return name === undefined
            ? Meteor.user() && Meteor.user().profile.firstName
            : name;
    },
    editNameDisabled() {
        const user = Meteor.user();
        if (!user) return true;

        const name = user.profile.firstName;
        const newName = Template.instance().state.get('name');

        if (newName === '') return true;
        if (!newName) return true;
        if (name === newName) return true;
        return false;
    }
});

Template.editName.events({
    'input input[name="name"]'(event) {
        Template.instance().state.set('name', event.target.value);
    },
    'submit .edit-name-form'(event) {
        event.preventDefault();
        Meteor.call('users.updateName', Template.instance().state.get('name'));
    }
});

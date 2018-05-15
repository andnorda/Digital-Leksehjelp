import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Subjects } from '/imports/api/subjects/subjects.js';
import '../../components/input/input.js';
import '../../components/select/select.js';
import '../../components/button/button.js';
import '../../components/tag/tag.js';

import './myProfile.html';
import './myProfile.less';

Template.myProfile.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.mySubjects.helpers({
    subjects() {
        return Subjects.find()
            .fetch()
            .filter(
                subject =>
                    !Meteor.user()
                        .profile.subjects.map(s => s.subjectId)
                        .includes(subject._id)
            )
            .map(subject => subject.name);
    },
    addSubject() {
        return name => {
            const subject = Subjects.findOne({ name });
            subject && Meteor.call('subjects.addSubjectToProfile', subject._id);
        };
    },
    mySubjects() {
        if (Meteor.user()) {
            const subjects = Meteor.user().profile.subjects.map(subject =>
                Subjects.findOne(subject.subjectId)
            );
            return subjects;
        }
        return null;
    },
    removeSubject() {
        const id = this._id;
        return () => Meteor.call('subjects.removeSubjectFromProfile', id);
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

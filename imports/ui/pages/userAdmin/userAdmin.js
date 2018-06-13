import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Config } from '/imports/api/config/config.js';
import userRoles from '/imports/userRoles.js';
import '../../components/input/input.js';
import '../../components/select/select.js';
import '../../components/button/button.js';
import '../../components/serviceStatus/serviceStatus.js';

import './userAdmin.html';
import './userAdmin.less';

Template.addUser.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.addUser.helpers({
    name() {
        return Template.instance().state.get('name');
    },
    email() {
        return Template.instance().state.get('email');
    },
    role() {
        return Template.instance().state.get('role');
    },
    userRoles() {
        return userRoles;
    },
    newUserDisabled() {
        const state = Template.instance().state;
        return !(state.get('name') && state.get('email') && state.get('role'));
    },
    onRoleChange() {
        const state = Template.instance().state;
        return role => state.set('role', role);
    }
});

Template.addUser.events({
    'input input[name="name"]'(event) {
        Template.instance().state.set('name', event.target.value);
    },
    'input input[name="email"]'(event) {
        Template.instance().state.set('email', event.target.value);
    },
    'submit .add-user-form'(event) {
        event.preventDefault();
        const state = Template.instance().state;
        const firstName = state.get('name');
        const email = state.get('email');
        const role = state.get('role');
        const allowVideohelp = true;
        Meteor.call('users.create', {
            username: email,
            email,
            profile: {
                firstName,
                role,
                allowVideohelp
            }
        });
        state.set('name', undefined);
        state.set('email', undefined);
        state.set('role', undefined);
    }
});

Template.allUsers.onCreated(function() {
    this.autorun(() => {
        this.subscribe('users');
    });
});

Template.allUsers.helpers({
    users() {
        return Meteor.users.find({});
    }
});

Template.user.helpers({
    name() {
        return this.profile.firstName;
    },
    email() {
        return this.username;
    },
    subjects() {
        return (this.subjects || []).join(', ');
    },
    role() {
        return this.profile.role;
    },
    userRoles() {
        return userRoles;
    },
    updateRole() {
        return role =>
            Meteor.call('users.updateRole', { userId: this._id, role });
    },
    deleteUser() {
        const id = this._id;
        return () => Meteor.call('users.remove', id);
    }
});

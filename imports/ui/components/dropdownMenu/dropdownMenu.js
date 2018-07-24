import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './dropdownMenu.html';
import './dropdownMenu.less';

Template.dropdownMenu.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.set('active', false);
});

Template.dropdownMenu.helpers({
    isActive() {
        return Template.instance().state.get('active');
    }
});

Template.dropdownMenu.events({
    'click .menu-button'() {
        const state = Template.instance().state;
        state.set('active', !state.get('active'));
    },
    'click .dropdownMenuItem'() {
        this.onClick && this.onClick();
    }
});

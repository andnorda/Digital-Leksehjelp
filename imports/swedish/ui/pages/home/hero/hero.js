import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './hero.html';
import './hero.less';

Template.hero.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.hero.helpers({
    readMoreIsOpen() {
        return Template.instance().state.get('readMoreIsOpen');
    }
});

Template.hero.events({
    'click .readMore a'() {
        const state = Template.instance().state;
        state.set('readMoreIsOpen', !state.get('readMoreIsOpen'));
    }
});

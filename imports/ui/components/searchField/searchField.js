import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';

import './searchField.html';
import './searchField.less';

Template.searchField.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.searchField.events({
    'input .searchField'(event) {
        Template.instance().state.set('query', event.target.value);
    },
    'keydown .searchField'(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            Router.go(
                `/sok?query=${Template.instance().state.get('query') || ''}`
            );
        }
    }
});

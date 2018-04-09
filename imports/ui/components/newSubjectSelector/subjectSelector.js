import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import { Subjects } from '/imports/api/subjects/subjects.js';
import Fuse from 'fuse.js';

import './subjectSelector.html';

const isAvailable = ({ _id }) =>
    Meteor.users
        .find({
            $and: [
                { 'profile.subjects.subjectId': _id },
                { 'status.online': true },
                { 'profile.allowVideohelp': true },
                { 'profile.firstName': { $not: 'Orkis' } }
            ]
        })
        .count() > 0;

const sortSubjects = (a, b) => {
    const aAvailable = isAvailable(a);
    const bAvailable = isAvailable(b);
    if (bAvailable && !aAvailable) {
        return 1;
    } else if (!bAvailable && aAvailable) {
        return -1;
    } else {
        return (b.videoChatCount || 0) - (a.videoChatCount || 0);
    }
};

Template.newSubjectSelector.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('subjects');
        this.state.set(
            'subjects',
            Subjects.find()
                .map(s => s)
                .sort(sortSubjects)
                .map((subject, index) => ({ ...subject, index }))
        );
    });
});

const search = (subjects, query) => {
    if (!query) {
        return subjects;
    }

    const fuse = new Fuse(subjects, {
        keys: ['name'],
        threshold: 0.2
    });

    return fuse
        .search(query)
        .sort(sortSubjects)
        .map((subject, index) => ({ ...subject, index }));
};

Template.newSubjectSelector.helpers({
    subjects() {
        const state = Template.instance().state;
        return search(state.get('subjects'), state.get('query'));
    },

    value() {
        const state = Template.instance().state;
        return state.get('query') || state.get('value');
    },

    showDropdown() {
        const state = Template.instance().state;
        return (
            state.get('active') &&
            search(state.get('subjects'), state.get('query'))
        );
    },

    isSubjectAvailable() {
        return isAvailable(this);
    },

    isActive() {
        return Template.instance().state.get('activeIndex') === this.index;
    }
});

Template.newSubjectSelector.events({
    'input .searchField'(event) {
        const state = Template.instance().state;
        state.set('query', event.target.value);
        state.set('activeIndex', undefined);

        if (!event.target.value) {
            state.set('value', undefined);
        }
    },

    'keydown .searchField'(event) {
        const state = Template.instance().state;
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();

                if (state.get('activeIndex') === undefined) {
                    state.set('activeIndex', state.get('subjects').length - 1);
                } else {
                    state.set(
                        'activeIndex',
                        (state.get('activeIndex') -
                            1 +
                            state.get('subjects').length) %
                            state.get('subjects').length
                    );
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (state.get('activeIndex') === undefined) {
                    state.set('activeIndex', 0);
                } else {
                    state.set(
                        'activeIndex',
                        (state.get('activeIndex') + 1) %
                            state.get('subjects').length
                    );
                }
                break;
            case 'Enter':
                event.preventDefault();
                const index = state.get('activeIndex');
                const results = search(
                    state.get('subjects'),
                    state.get('query')
                );

                if (results.length === 1) {
                    const subject = results[0];
                    if (isAvailable(subject)) {
                        state.set('value', subject.name);
                        $('.searchField').blur();
                    }
                } else if (index !== undefined) {
                    const subject = results[index];
                    if (isAvailable(subject)) {
                        state.set('value', subject.name);
                        $('.searchField').blur();
                    }
                }
                break;
        }
    },

    'mousedown .glyphicon'(event) {
        event.preventDefault();
        const searchField = $('.searchField');
        if (!searchField.is(':focus')) searchField.focus();
    },

    'click .searchField'() {
        const state = Template.instance().state;

        state.set('activeIndex', undefined);
    },

    'focus .searchField'() {
        Template.instance().state.set('active', true);
    },

    'blur .searchField'() {
        const state = Template.instance().state;
        state.set('active', false);
        state.set('activeIndex', undefined);
        state.set('query', undefined);
    },

    'mousedown .subject'(event) {
        if (isAvailable(this)) {
            Template.instance().state.set('value', this.name);
        } else {
            event.preventDefault();
        }
    },

    'mousemove .subject'() {
        Template.instance().state.set('activeIndex', this.index);
    }
});

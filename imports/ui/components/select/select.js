import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import Fuse from 'fuse.js';

import './select.html';
import './select.less';

Template.select.onCreated(function() {
    this.state = new ReactiveDict();
});

const search = (options, query) => {
    if (!query) {
        return options;
    }

    const fuse = new Fuse(options, {
        threshold: 0.2,
        includeMatches: true
    });

    return fuse.search(query).map(({ matches }) => matches[0].value);
};

Template.select.helpers({
    value() {
        const state = Template.instance().state;
        const currentData = Template.currentData();
        return currentData.filter
            ? state.get('query') || currentData.value
            : currentData.value || this.placeholder;
    },

    isOpen() {
        return Template.instance().state.get('isOpen');
    },

    options() {
        let options = this.filter
            ? search(this.options, Template.instance().state.get('query'))
            : this.options;

        if (this.sort) {
            options = options.sort(this.sort);
        }

        return options.map((value, index) => ({
            value,
            index,
            onChange: this.onChange,
            isAvailable: this.isAvailable ? this.isAvailable(value) : true
        }));
    },

    optionArgs() {
        const state = Template.instance().state;
        return {
            value: this.value,
            isActive: state.get('activeIndex') === this.index,
            onMouseMove: () => state.set('activeIndex', this.index),
            onMouseLeave: () => state.set('activeIndex', undefined),
            onMouseDown: event => {
                event.preventDefault();
                state.set('query', undefined);
                state.set('isOpen', false);
                this.onChange(this.isAvailable ? this.value : undefined);
            },
            isAvailable: this.isAvailable
        };
    }
});

Template.select.events({
    'click button.value, click input.searchField'(event) {
        event.preventDefault();

        const state = Template.instance().state;
        state.set('isOpen', !state.get('isOpen'));
    },

    'blur button.value'() {
        const state = Template.instance().state;
        state.set('isOpen', false);
        state.set('activeIndex', undefined);
    },

    'blur input.searchField'() {
        const state = Template.instance().state;
        state.set('isOpen', false);
        state.set('activeIndex', undefined);
    },

    'keydown button.value, keydown input.searchField'(event) {
        const state = Template.instance().state;
        switch (event.key) {
            case 'Up':
            case 'ArrowUp':
                event.preventDefault();
                state.set('isOpen', true);
                if (state.get('activeIndex') === undefined) {
                    state.set('activeIndex', this.options.length - 1);
                } else {
                    state.set(
                        'activeIndex',
                        (state.get('activeIndex') - 1 + this.options.length) %
                            this.options.length
                    );
                }
                break;
            case 'Down':
            case 'ArrowDown':
                event.preventDefault();
                state.set('isOpen', true);
                if (state.get('activeIndex') === undefined) {
                    state.set('activeIndex', 0);
                } else {
                    state.set(
                        'activeIndex',
                        (state.get('activeIndex') + 1) % this.options.length
                    );
                }
                break;
            case 'Enter':
                event.preventDefault();
                if (state.get('isOpen')) {
                    const index = state.get('activeIndex');
                    this.onChange(
                        !this.isAvailable ||
                        this.isAvailable(this.options[index])
                            ? this.options[index]
                            : undefined
                    );
                    state.set('query', undefined);
                    state.set('isOpen', false);
                    state.set('activeIndex', undefined);
                }
                break;
            case ' ':
                event.preventDefault();
                if (state.get('isOpen')) {
                    const index = state.get('activeIndex');
                    this.onChange(this.options[index]);
                    state.set('isOpen', false);
                    state.set('activeIndex', undefined);
                } else {
                    state.set('isOpen', true);
                }
                break;
            case 'Escape':
                event.preventDefault();
                state.set('isOpen', false);
                state.set('activeIndex', undefined);
                break;
        }
    },

    'input .searchField'(event) {
        const state = Template.instance().state;
        state.set('isOpen', true);

        if (!event.target.value && state.get('query') !== undefined) {
            state.set('value', undefined);
        }

        state.set('query', event.target.value);
        state.set('activeIndex', undefined);
    }
});

Template.selectOption.events({
    mousemove(event) {
        this.onMouseMove(event);
    },
    mouseleave(event) {
        this.onMouseLeave(event);
    },
    mousedown(event) {
        this.onMouseDown(event);
    }
});

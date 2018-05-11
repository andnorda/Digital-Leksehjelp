import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './select.html';
import './select.less';

Template.select.onCreated(function() {
    this.state = new ReactiveDict();
});

Template.select.helpers({
    value() {
        const state = Template.instance().state;
        return Template.currentData().value || this.placeholder;
    },

    isOpen() {
        return Template.instance().state.get('isOpen');
    },

    options() {
        return this.options.map((value, index) => ({
            value,
            index,
            onChange: this.onChange
        }));
    },

    optionArgs() {
        const state = Template.instance().state;
        return {
            value: this.value,
            isActive: state.get('activeIndex') === this.index,
            onMouseMove: () => state.set('activeIndex', this.index),
            onMouseLeave: () => state.set('activeIndex', undefined),
            onMouseDown: () => {
                this.onChange(this.value);
            }
        };
    }
});

Template.select.events({
    'click button.value'(event) {
        event.preventDefault();

        const state = Template.instance().state;
        state.set('isOpen', !state.get('isOpen'));
    },

    'blur button.value'() {
        const state = Template.instance().state;
        state.set('isOpen', false);
        state.set('activeIndex', undefined);
    },

    'keydown button.value'(event, templateInstance) {
        const state = Template.instance().state;
        switch (event.key) {
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
                    this.onChange(this.options[index]);
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
    }
});

Template.selectOption.events({
    mousemove() {
        this.onMouseMove();
    },
    mouseleave() {
        this.onMouseLeave();
    },
    mousedown() {
        this.onMouseDown();
    }
});

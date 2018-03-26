import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { Questions } from '/imports/api/questions/questions.js';

import { CONSTANTS } from '/imports/constants.js';

import './search.html';

Template.search.onCreated(function searchOnCreated() {
    this.autorun(() => {
        this.subscribe('subjects');

        // https://github.com/EventedMind/iron-router/issues/1088
        const { params: { query } } = Router.current();
        Object.keys(query).forEach(function(key) {
            query[key] = query[key].replace(/\+/g, ' ');
        });

        this.state = new ReactiveDict();
        Meteor.call('questions.searchCount', query, (error, result) => {
            this.state.set('questionSearchCount', result);
        });
        this.subscribe('questions.search', query);
    });
});

const updateQueryStringParameter = function(uri, key, value) {
    const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
        return uri.replace(re, `$1${key}=${value}$2`);
    }
    return `${uri + separator + key}=${value}`;
};

Template.search.helpers({
    searchResults() {
        return Questions.find({});
    },
    queryParams() {
        return Router.current().params.query;
    },
    numberOfResults() {
        const count = Template.instance().state.get('questionSearchCount');

        if (!count || count === 0) {
            return 'Fant ingen resultater';
        } else if (count === 1) {
            return 'Fant ett resultat';
        }
        return `Fant ${count} resultater`;
    }
});

Template.searchForm.helpers({
    subjects() {
        return Subjects.find({}, { sort: { name: 1 } });
    }
});

Template.pagination.onCreated(function searchOnCreated() {
    this.autorun(() => {
        // https://github.com/EventedMind/iron-router/issues/1088
        const { params: { query } } = Router.current();
        Object.keys(query).forEach(function(key) {
            query[key] = query[key].replace(/\+/g, ' ');
        });

        this.state = new ReactiveDict();
        Meteor.call('questions.searchCount', query, (error, result) => {
            this.state.set('questionSearchCount', result);
        });
    });
});

Template.pagination.helpers({
    pages() {
        const numberOfResults =
            Template.instance().state.get('questionSearchCount') || 0;
        const numberOfPages =
            numberOfResults / CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE;
        const currentOffset = Router.current().params.query.offset || 0;

        const pages = [];
        for (let i = 0; i < numberOfPages; i += 1) {
            const offset = i * CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE;

            const pageSearchUrl = updateQueryStringParameter(
                window.location.search,
                'offset',
                offset
            );

            const page = {
                url: `/sok${pageSearchUrl}`,
                index: i + 1,
                active:
                    currentOffset /
                        CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE ===
                    i
                        ? 'active'
                        : ''
            };

            pages.push(page);
        }

        return pages;
    }
});

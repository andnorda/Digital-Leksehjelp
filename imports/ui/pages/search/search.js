import { Subjects } from '/imports/api/subjects/subjects.js';
import { Questions } from '/imports/api/questions/questions.js';

import { CONSTANTS } from '/imports/constants.js';

import './search.html';

Template.search.onCreated(function searchOnCreated() {
    this.autorun(() => {
        this.subscribe('subjects');

        // https://github.com/EventedMind/iron-router/issues/1088
        const query = Router.current().params.query;
        Object.keys(query).forEach(function(key) {
            query[key] = query[key].replace(/\+/g, ' ');
        });

        Meteor.call('questions.searchCount', query, function(error, result) {
            Session.set('questionSearchCount', result);
        });
        this.subscribe('questions.search', query);
    });
});

var updateQueryStringParameter = function(uri, key, value) {
    var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    var separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
        return uri + separator + key + '=' + value;
    }
};

Template.search.helpers({
    searchResults: function() {
        return Questions.find({});
    },
    queryParams: function() {
        return Router.current().params.query;
    },
    numberOfResults: function() {
        var count = Session.get('questionSearchCount');

        if (!count || count === 0) {
            return 'Fant ingen resultater';
        } else if (count === 1) {
            return 'Fant ett resultat';
        } else {
            return 'Fant ' + count + ' resultater';
        }
    }
});

Template.searchForm.helpers({
    subjects: function() {
        return Subjects.find({}, { sort: { name: 1 } });
    }
});

Template.pagination.helpers({
    pages: function() {
        var numberOfResults = Session.get('questionSearchCount') || 0;
        var numberOfPages =
            numberOfResults / CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE;
        var currentOffset = Router.current().params.query.offset || 0;

        var pages = [];
        for (var i = 0; i < numberOfPages; i++) {
            var offset = i * CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE;

            var pageSearchUrl = updateQueryStringParameter(
                window.location.search,
                'offset',
                offset
            );

            var page = {
                url: '/sok' + pageSearchUrl,
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

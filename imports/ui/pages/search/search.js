import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { Questions } from '/imports/api/questions/questions.js';
import { CONSTANTS, GRADES } from '/imports/constants.js';
import { stringify } from 'query-string';
import '../../components/questionList/questionList.js';

import './search.html';
import './search.less';

Template.search.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        this.subscribe('subjects');
        this.subscribe('questions.search', Router.current().params.query);

        if (this.state.get('query') === undefined) {
            this.state.set('query', Router.current().params.query.query);
        }
    });
});

Template.search.helpers({
    query() {
        return Template.instance().state.get('query');
    },
    subject() {
        return Router.current().params.query.subject;
    },
    setSubject() {
        return subject =>
            Router.go(
                `/sok?${stringify({
                    ...Router.current().params.query,
                    subject: subject === 'Alle fag' ? undefined : subject
                })}`
            );
    },
    grades() {
        return ['Alle trinn', ...GRADES];
    },
    grade() {
        return Router.current().params.query.grade;
    },
    setGrade() {
        return grade =>
            Router.go(
                `/sok?${stringify({
                    ...Router.current().params.query,
                    grade: grade === 'Alle trinn' ? undefined : grade
                })}`
            );
    },
    sortType() {
        const sortTypes = {
            date: 'Dato',
            relevance: 'Relevanse'
        };
        return sortTypes[Router.current().params.query.sortType];
    },
    sortTypes() {
        return ['Dato', 'Relevanse'];
    },
    setSortType() {
        const sortTypes = {
            Dato: 'date',
            Relevanse: 'relevance'
        };
        return sortType =>
            Router.go(
                `/sok?${stringify({
                    ...Router.current().params.query,
                    sortType: sortTypes[sortType]
                })}`
            );
    }
});

Template.search.events({
    'input .query'(event) {
        Template.instance().state.set('query', event.target.value);
    },
    'submit form'(event) {
        event.preventDefault();

        Router.go(
            `/sok?${stringify({
                ...Router.current().params.query,
                query: Template.instance().state.get('query')
            })}`
        );
    }
});

Template.searchResults.onCreated(function() {
    this.state = new ReactiveDict();

    this.autorun(() => {
        Meteor.call(
            'questions.searchCount',
            Router.current().params.query,
            (error, result) => {
                this.state.set('questionSearchCount', result);
            }
        );
    });
});

Template.searchResults.helpers({
    searchResults() {
        return Questions.find({});
    },
    searchCount() {
        return Template.instance().state.get('questionSearchCount') || 'ingen';
    }
});

const updateQueryStringParameter = function(uri, key, value) {
    const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
        return uri.replace(re, `$1${key}=${value}$2`);
    }
    return `${uri + separator + key}=${value}`;
};

Template.pagination.helpers({
    pages() {
        const numberOfResults = Number(Template.currentData().searchCount || 0);
        const numberOfPages =
            numberOfResults / CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE;
        const currentOffset = Number(Router.current().params.query.offset || 0);

        const currentPage = Math.floor(
            currentOffset / CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE
        );
        const start = currentPage - 2 >= 0 ? currentPage - 2 : 0;

        let pages = [];
        for (let i = start; i < Math.min(numberOfPages, start + 4); i += 1) {
            pages.push({
                url: `/sok?${stringify({
                    ...Router.current().params.query,
                    offset: i * CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE
                })}`,
                active: i == currentPage,
                page: i + 1
            });
        }
        return pages;
    },
    showBackButton() {
        const currentOffset = Number(Router.current().params.query.offset || 0);
        return currentOffset > 0;
    },
    showForwardButton() {
        const currentOffset = Number(Router.current().params.query.offset || 0);
        const numberOfResults = Number(Template.currentData().searchCount || 0);
        return (
            currentOffset + CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE <
            numberOfResults
        );
    },
    backUrl() {
        const currentOffset = Number(Router.current().params.query.offset || 0);
        return `/sok?${stringify({
            ...Router.current().params.query,
            offset: Math.max(
                currentOffset - CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE,
                0
            )
        })}`;
        return `/sok?offset=${Math.max(
            currentOffset - CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE,
            0
        )}`;
    },
    forwardUrl() {
        const numberOfResults = Number(Template.currentData().searchCount || 0);
        const currentOffset = Number(Router.current().params.query.offset || 0);
        return `/sok?${stringify({
            ...Router.current().params.query,
            offset: Math.min(
                currentOffset + CONSTANTS.NUMBER_OF_SEARCH_RESULTS_PER_PAGE,
                numberOfResults - 1
            )
        })}`;
    }
});

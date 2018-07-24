import {
    Questions,
    questionPrivateFields,
    questionPublicFields
} from './questions.js';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { CONSTANTS } from '/imports/constants.js';

const isNumber = obj =>
    !isNaN(obj - 0) && obj !== null && obj !== '' && obj !== false;

const parseSearchParams = ({
    query,
    subject,
    grade,
    sortType,
    limit,
    offset,
    userId
}) => {
    const selector = { $and: [] };
    const options = { fields: { score: { $meta: 'textScore' } } };

    if (query) {
        selector.$and.push({ $text: { $search: query } });
    }
    if (subject) {
        const s = Subjects.findOne({ name: subject });
        if (s) {
            selector.$and.push({ subjectId: s._id });
        }
    }
    if (grade) {
        selector.$and.push({ grade });
    }

    // default sorting
    options.sort = { score: { $meta: 'textScore' } };

    if (sortType === 'date') {
        options.sort = { questionDate: -1 };
    }

    // default limit
    options.limit = CONSTANTS.SEARCH_DEFAULT_LIMIT;

    if (isNumber(limit)) {
        options.limit = parseInt(limit, 10);
    }

    if (options.limit > CONSTANTS.SEARCH_MAX_LIMIT) {
        options.limit = CONSTANTS.SEARCH_MAX_LIMIT;
    }

    if (isNumber(offset)) {
        options.skip = parseInt(offset, 10);
    }

    return { selector, options };
};

const searchCriteraBuilder = (params, userId) => {
    const searchCritera = parseSearchParams(params);

    searchCritera.selector.$and.push({ answer: { $exists: true } });

    if (userId) {
        if (params.hasOwnProperty('related') && params.related) {
            searchCritera.selector.$and.push(
                { approvedBy: { $exists: true } },
                { publishedBy: { $exists: true } }
            );
        }

        _.extend(searchCritera.options.fields, questionPrivateFields);
    } else {
        searchCritera.selector.$and.push(
            { approvedBy: { $exists: true } },
            { publishedBy: { $exists: true } }
        );

        _.extend(searchCritera.options.fields, questionPublicFields);
    }

    return searchCritera;
};

const search = params => {
    const searchCritera = searchCriteraBuilder(params);
    return Questions.find(searchCritera.selector, searchCritera.options);
};

export default { parseSearchParams, searchCriteraBuilder, search };

var isNumber = function (obj) {
  return ! isNaN (obj-0) && obj !== null && obj !== "" && obj !== false;
}

this.questionPublicFields = {
    answer: true,
    answerDate: true,
    answerAttachmentUrl: true,
    grade: true,
    question: true,
    questionDate: true,
    subjectId: true,
    title: true
}

this.questionPrivateFields = {
    studentEmail: false
}

this.QuestionHelpers = {
    parseSearchParams: function (params) {
        var selector = { $and: [] };
        var options = { fields: { score: { $meta: "textScore" }}};

        if (params.hasOwnProperty('q') && params['q'] !== '') {
            selector.$and.push({ "$text": { "$search": params.q } });
        }
        if (params.hasOwnProperty('subject') && params['subject'] !== '_all') {
            var subject = Subjects.findOne({ humanReadableId: params.subject });
            if (subject) {
                selector.$and.push({ subjectId: subject._id });
            }
        }
        if (params.hasOwnProperty('grade') && params['grade'] !== '_all') {
            selector.$and.push({ grade: params.grade });
        }

        // default sorting
        options['sort'] = { score: { $meta: "textScore" }};

        if (params.hasOwnProperty('sort')) {
            if (params['sort'] === 'date') {
                options['sort'] = { questionDate: -1 };
            }
        }

        // default limit
        options['limit'] = CONSTANTS.SEARCH_DEFAULT_LIMIT;

        if (params.hasOwnProperty('limit') && isNumber(params.limit)) {
            options['limit'] = parseInt(params.limit);
        }

        if (options['limit'] > CONSTANTS.SEARCH_MAX_LIMIT) {
            options['limit'] = CONSTANTS.SEARCH_MAX_LIMIT;
        }

        if (params.hasOwnProperty('offset') && isNumber(params.offset)) {
            options['skip'] = parseInt(params.offset);
        }

        return {selector: selector, options: options};
    },
    searchCriteraBuilder: function (params, userId) {
        var searchCritera = QuestionHelpers.parseSearchParams(params);

        searchCritera.selector.$and.push({ answer: { $exists: true }});

        if (userId) {
            if (params.hasOwnProperty('related') && params.related) {
                searchCritera.selector.$and.push(
                    { verifiedBy: { $exists: true }},
                    { publishedBy: { $exists: true }}
                );
            }

            _.extend(searchCritera.options['fields'], questionPrivateFields);
        } else {
            searchCritera.selector.$and.push(
                { verifiedBy: { $exists: true }},
                { publishedBy: { $exists: true }}
            );

            _.extend(searchCritera.options['fields'], questionPublicFields);
        }

        return searchCritera;
    },
    search: function (params, userId) {
        var searchCritera = QuestionHelpers.searchCriteraBuilder(params, userId);

        return Questions.find(searchCritera.selector, searchCritera.options);
    }
}

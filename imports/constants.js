export const GRADES = [
    '5.-7. klasse',
    '8. klasse',
    '9. klasse',
    '10. klasse',
    'Vg 1',
    'Vg 2',
    'Vg 3'
];

export const STUDENT_SESSION_STATE = {
    WAITING: 'Venter på en ledig frivillig',
    READY: 'Frivillig er klar',
    GETTING_HELP: 'Får leksehjelp',
    ENDED: 'Ferdig'
};

export const QUESTION_SUBSCRIPTION_LEVEL = {
    REGULAR: 'REGULAR',
    ALL: 'ALL'
};

export const CONSTANTS = {
    RELATED_QUESTION_SEARCH_THRESHOLD: 1000,
    RELATED_QUESTION_SEARCH_MIN_QUESTION_LENGTH: 3,
    RELATED_QUESTION_SEARCH_LIMIT: 10,
    SEARCH_DEFAULT_LIMIT: 100,
    S3_MAX_UPLOAD_FILE_SIZE: 1024 * 1024 * 5, // https://github.com/Lepozepo/S3/issues/52
    SEARCH_MAX_LIMIT: 100,
    NUMBER_OF_SEARCH_RESULTS_PER_PAGE: 10
};

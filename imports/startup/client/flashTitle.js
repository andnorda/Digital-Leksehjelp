import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';

import { STUDENT_SESSION_STATE } from '/imports/constants';

import { ROLES } from '/imports/constants';

const original = document.title;
let timeout;

export const flashTitle = function(newMsg, howManyTimes) {
    function step() {
        document.title = document.title == original ? newMsg : original;

        if (--howManyTimes > 0) {
            timeout = setTimeout(step, 1000);
        }
    }

    howManyTimes = parseInt(howManyTimes);

    if (isNaN(howManyTimes)) {
        howManyTimes = 5;
    }

    cancelFlashTitle(timeout);
    step();
};

export const cancelFlashTitle = function() {
    clearTimeout(timeout);
    document.title = original;
};

Deps.autorun(function() {
    var user = Meteor.user();
    if (
        user &&
        (user.profile.allowVideohelp || user.profile.role === ROLES.ADMIN)
    ) {
        var number = StudentSessions.find({
            state: STUDENT_SESSION_STATE.WAITING
        }).count();

        flashTitle(number + ' i videohjelpkø', 10);
    }
});

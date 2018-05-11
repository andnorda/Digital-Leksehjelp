import { Meteor } from 'meteor/meteor';
import { Deps } from 'meteor/deps';
import { StudentSessions } from '/imports/api/studentSessions/studentSessions.js';
import { STUDENT_SESSION_STATE } from '/imports/constants.js';
import { ADMIN } from '/imports/userRoles.js';

const original = document.title;
let timeout;

export const cancelFlashTitle = function() {
    clearTimeout(timeout);
    document.title = original;
};

export const flashTitle = function(newMsg, howManyTimes) {
    let count = parseInt(howManyTimes, 10);

    if (isNaN(count)) {
        count = 5;
    }

    function step() {
        document.title = document.title === original ? newMsg : original;

        count -= 1;
        if (count > 0) {
            timeout = setTimeout(step, 1000);
        }
    }

    cancelFlashTitle(timeout);
    step();
};

Deps.autorun(function() {
    const user = Meteor.user();
    if (user && (user.profile.allowVideohelp || user.profile.role === ADMIN)) {
        const number = StudentSessions.find({
            state: STUDENT_SESSION_STATE.WAITING
        }).count();

        flashTitle(`${number} i videohjelpkø`, 10);
    }
});

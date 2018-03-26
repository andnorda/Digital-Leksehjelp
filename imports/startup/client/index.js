import { Meteor } from 'meteor/meteor';
import { Deps } from 'meteor/deps';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import mixpanel from '/imports/mixpanel';

import './routes.js';
import './templateHelpers.js';
import './flashTitle.js';

Deps.autorun(function() {
    if (Meteor.user()) {
        if (Meteor.user().profile && Meteor.user().profile.firstName) {
            if (Meteor.user().profile.setSubjectsAvailable) {
                Meteor.call('subjects.setAvailable', {
                    subjects: Meteor.user().profile.subjects
                });
            }
            if (Meteor.user().profile.forceLogOut) {
                Meteor.logout();
            }
        }
    }
});

FlashMessages.configure({
    autoHide: false
});

Meteor.Spinner.options = {
    top: '3'
};

function initMixpanel() {
    let environment;
    Meteor.call('getEnvironment', function(error, result) {
        if (error) {
            environment = 'development';
        } else {
            environment = result;

            if (environment === 'development') {
                mixpanel.init('2ba4e2b936870c8ee8537a3d9d76dea7');
            } else if (environment === 'production') {
                mixpanel.init('f84c7b2904d686b254dc2d1d032d6e56');
            }

            mixpanel.track('Antall besøkende', {
                url: window.location.pathname
            });
        }
    });
}

function initGetSiteControl() {
    window.showSurvey = function() {
        Meteor.call('getEnvironment', function(error, result) {
            let getSiteControlSurveyUrl =
                '//widgets.getsitecontrol.com/130166/script.js'; // development
            if (!error && result === 'production') {
                getSiteControlSurveyUrl =
                    '//widgets.getsitecontrol.com/43318/script.js';
            }

            (function(w, i, d, g, e, t, s) {
                w[d] = w[d] || [];
                t = i.createElement(g);
                t.async = 1;
                t.src = e;
                s = i.getElementsByTagName(g)[0];
                s.parentNode.insertBefore(t, s);
            })(window, document, '_gscq', 'script', getSiteControlSurveyUrl);
        });
    };
}

Meteor.startup(function() {
    initMixpanel();
    initGetSiteControl();
});

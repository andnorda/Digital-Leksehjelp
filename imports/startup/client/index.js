import { Meteor } from 'meteor/meteor';
import { Deps } from 'meteor/deps';
import mixpanel from '/imports/mixpanel';
import '/imports/api/questions/methods.js';

import './routes.js';
import './templateHelpers.js';

Meteor.Spinner.options = {
    top: '3'
};

function initMixpanel() {
    mixpanel.init(Meteor.isProduction
        ? 'f84c7b2904d686b254dc2d1d032d6e56'
        : '2ba4e2b936870c8ee8537a3d9d76dea7');
    mixpanel.track('Antall besøkende', {
        url: window.location.pathname
    });
}

function initGetSiteControl() {
    window.showSurvey = function() {
        const getSiteControlSurveyUrl = Meteor.isProduction
            ? '//widgets.getsitecontrol.com/43318/script.js'
            : '//widgets.getsitecontrol.com/130166/script.js';
        (function(w, i, d, g, e, t, s) {
            w[d] = w[d] || [];
            t = i.createElement(g);
            t.async = 1;
            t.src = e;
            s = i.getElementsByTagName(g)[0];
            s.parentNode.insertBefore(t, s);
        })(window, document, '_gscq', 'script', getSiteControlSurveyUrl);
    };
}

Meteor.startup(function() {
    initMixpanel();
    initGetSiteControl();
});

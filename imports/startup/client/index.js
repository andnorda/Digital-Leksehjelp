import { Meteor } from 'meteor/meteor';
import { Deps } from 'meteor/deps';
import mixpanel from '/imports/mixpanel';

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

Meteor.startup(function() {
    initMixpanel();
});

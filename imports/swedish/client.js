import { Meteor } from 'meteor/meteor';
import './routes.js';

function initGetSiteControl() {
    window.showSurvey = function() {
        Meteor.call('getEnvironment', function(error, result) {
            (function(w, i, d, g, e, t, s) {
                w[d] = w[d] || [];
                t = i.createElement(g);
                t.async = 1;
                t.src = e;
                s = i.getElementsByTagName(g)[0];
                s.parentNode.insertBefore(t, s);
            })(
                window,
                document,
                '_gscq',
                'script',
                '//widgets.getsitecontrol.com/188492/script.js'
            );
        });
    };
}

Meteor.startup(function() {
    initGetSiteControl();
});

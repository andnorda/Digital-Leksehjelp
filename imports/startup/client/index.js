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
    (function(e, b) {
        if (!b.__SV) {
            var a, f, i, g;
            window.mixpanel = b;
            a = e.createElement('script');
            a.type = 'text/javascript';
            a.async = !0;
            a.src =
                ('https:' === e.location.protocol ? 'https:' : 'http:') +
                '//cdn.mxpnl.com/libs/mixpanel-2.2.min.js';
            f = e.getElementsByTagName('script')[0];
            f.parentNode.insertBefore(a, f);
            b._i = [];
            b.init = function(a, e, d) {
                function f(b, h) {
                    var a = h.split('.');
                    2 == a.length && ((b = b[a[0]]), (h = a[1]));
                    b[h] = function() {
                        b.push(
                            [h].concat(Array.prototype.slice.call(arguments, 0))
                        );
                    };
                }
                var c = b;
                'undefined' !== typeof d ? (c = b[d] = []) : (d = 'mixpanel');
                c.people = c.people || [];
                c.toString = function(b) {
                    var a = 'mixpanel';
                    'mixpanel' !== d && (a += '.' + d);
                    b || (a += ' (stub)');
                    return a;
                };
                c.people.toString = function() {
                    return c.toString(1) + '.people (stub)';
                };
                i = 'disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user'.split(
                    ' '
                );
                for (g = 0; g < i.length; g++) f(c, i[g]);
                b._i.push([a, e, d]);
            };
            b.__SV = 1.2;
        }
    })(document, window.mixpanel || []);

    var environment;
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
            var getSiteControlSurveyUrl =
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

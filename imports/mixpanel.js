const init = id => {
    (function(e, b) {
        if (!b.__SV) {
            let a, f, i, g;
            window.mixpanel = b;
            a = e.createElement('script');
            a.type = 'text/javascript';
            a.async = !0;
            a.src = `${
                e.location.protocol === 'https:' ? 'https:' : 'http:'
            }//cdn.mxpnl.com/libs/mixpanel-2.2.min.js`;
            f = e.getElementsByTagName('script')[0];
            f.parentNode.insertBefore(a, f);
            b._i = [];
            b.init = function(a, e, d) {
                function f(b, h) {
                    const a = h.split('.');
                    a.length == 2 && ((b = b[a[0]]), (h = a[1]));
                    b[h] = function() {
                        b.push(
                            [h].concat(Array.prototype.slice.call(arguments, 0))
                        );
                    };
                }
                let c = b;
                typeof d !== 'undefined' ? (c = b[d] = []) : (d = 'mixpanel');
                c.people = c.people || [];
                c.toString = function(b) {
                    let a = 'mixpanel';
                    d !== 'mixpanel' && (a += `.${d}`);
                    b || (a += ' (stub)');
                    return a;
                };
                c.people.toString = function() {
                    return `${c.toString(1)}.people (stub)`;
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

    window.mixpanel.init(id);
};

const track = (event, properties) => window.mixpanel.track(event, properties);

export default { init, track };

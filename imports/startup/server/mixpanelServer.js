import Mixpanel from 'mixpanel';

let mixpanel;

const init = id => {
    mixpanel = Mixpanel.init(id);
};

const track = (name, props) => mixpanel.track(name, props);

export default { init, track };

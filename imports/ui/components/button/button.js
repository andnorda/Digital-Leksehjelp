import { Template } from 'meteor/templating';

import './button.html';
import './button.less';

Template.button.events({
    click() {
        this.onClick && this.onClick();
    }
});

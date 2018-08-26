import { Template } from 'meteor/templating';

import './tag.html';
import './tag.less';

Template.tag.helpers({
    hasButton() {
        return this.onClick;
    }
});

Template.tag.events({
    'click button'() {
        this.onClick && this.onClick();
    }
});

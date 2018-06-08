import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './formMessage.html';
import './formMessage.less';

Template.formMessage.helpers({
    type() {
        return this.type || 'info';
    }
});

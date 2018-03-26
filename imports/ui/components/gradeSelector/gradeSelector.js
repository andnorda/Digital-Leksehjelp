import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './gradeSelector.html';

Template.gradeSelector.events({
    'click .grades'() {
        $('#chosen-grade').text(this);
    }
});

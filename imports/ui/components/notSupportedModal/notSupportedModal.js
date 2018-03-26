import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './notSupportedModal.html';

Template.notSupportedModal.events({
    'click a#moreInfoToQuestions'() {
        $('#notSupportedModal').modal('hide');
    }
});

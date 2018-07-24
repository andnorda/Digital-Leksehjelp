import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { format } from 'date-fns';

import './questionList.html';
import './questionList.less';

Template.questionList.helpers({
    title() {
        return this.title || this.question.substring(0, 50);
    },
    prettyDate() {
        return format(this.questionDate, 'DD.MM.YYYY');
    }
});

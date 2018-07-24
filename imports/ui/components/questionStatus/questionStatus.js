import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './questionStatus.html';
import './questionStatus.less';

Template.questionStatus.helpers({
    status() {
        if (this.publishedBy) {
            return 'Publisert';
        } else if (this.approvedBy) {
            return 'Godkjent (ikke publisert)';
        } else if (this.submittedForApprovalBy) {
            return 'Lagt til godkjenning';
        } else if (this.editedBy && this.editedBy.length) {
            return 'Redigert';
        } else {
            return 'Nytt spørsmål';
        }
    }
});

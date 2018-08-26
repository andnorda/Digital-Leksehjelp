import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';

import './modal.html';
import './modal.less';

let modal;

Template.modal.helpers({
    templateArgs() {
        return {
            hide: () => Blaze.remove(modal)
        };
    }
});

const show = templateName => {
    modal = Blaze.renderWithData(
        Template.modal,
        { templateName },
        document.body
    );
};

export default { show };

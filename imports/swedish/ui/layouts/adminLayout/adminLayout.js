import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import './adminLayout.html';
import './adminLayout.less';

import '../../components/loggedInHeader/loggedInHeader.js';
import '../../components/modal/modal.js';

Template.adminMenu.helpers({
    isActive(route) {
        return Router.current().route.getName() === route;
    }
});

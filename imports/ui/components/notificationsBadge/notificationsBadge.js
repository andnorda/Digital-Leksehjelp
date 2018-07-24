import './notificationsBadge.html';
import './notificationsBadge.less';

Template.notificationsBadge.helpers({
    count() {
        return this.count;
    }
});

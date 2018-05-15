import '../tag/tag.js';

import './tagList.html';
import './tagList.less';

Template.tagList.helpers({
    onClick() {
        const value = this.valueOf();
        const onClick = Template.parentData().onClick;
        return onClick && (() => onClick(value));
    }
});

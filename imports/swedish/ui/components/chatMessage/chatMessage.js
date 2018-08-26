import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';
import { format } from 'date-fns';
import filesize from 'filesize';
import urlRegex from '/imports/lib/url-regex';

import './chatMessage.html';

Template.chatComponent.onCreated(function() {
    this.autorun(() => {
        this.subscribe('users.loggedIn');
    });
});

Template.chatMessage.helpers({
    authorName() {
        const user = Meteor.users.findOne(this.author);
        return user ? user.profile.firstName : '';
    },
    prettyDate() {
        return format(this.createdAt, 'HH:mm');
    },
    isSelf() {
        return this.author === Meteor.userId();
    },
    isAttachment() {
        return this.type === 'attachment';
    },
    isInfo() {
        return this.type === 'info';
    },
    humanReadableSize() {
        return this.size ? filesize(this.size, { separator: ',' }) : '';
    },
    message() {
        return Spacebars.SafeString(
            this.message.replace(
                urlRegex({ strict: false }),
                match =>
                    `<a href="${
                        match.startsWith('http') ? match : 'http://' + match
                    }" target="_blank">${match}</a>`
            )
        );
    },
    name() {
        return this.message.includes('.')
            ? this.message
                  .split('.')
                  .slice(0, -1)
                  .join('.')
            : this.message;
    },
    suffix() {
        return this.message.includes('.')
            ? `.${this.message.split('.')[this.message.split('.').length - 1]}`
            : '';
    }
});

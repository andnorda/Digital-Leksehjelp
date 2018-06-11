import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Subjects } from '/imports/api/subjects/subjects.js';

import './subjectSelector.html';

const isAvailable = name =>
    Meteor.users
        .find({
            subjects: name,
            'status.online': true
        })
        .count() > 0;

Template.newSubjectSelector.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
        this.subscribe('users.loggedIn');
    });
});

Template.newSubjectSelector.helpers({
    subjects() {
        return Subjects.find().map(({ name }) => name);
    },
    onChange() {
        return this.onChange;
    },
    sort() {
        return (a, b) => {
            const aAvailable = isAvailable(a);
            const bAvailable = isAvailable(b);
            if (bAvailable && !aAvailable) {
                return 1;
            } else if (!bAvailable && aAvailable) {
                return -1;
            } else {
                const subjectA = Subjects.findOne({ name: a });
                const subjectB = Subjects.findOne({ name: b });
                return (
                    (subjectB ? subjectB.videoChatCount || 0 : 0) -
                    (subjectA ? subjectA.videoChatCount || 0 : 0)
                );
            }
        };
    },
    isAvailable() {
        return isAvailable;
    }
});

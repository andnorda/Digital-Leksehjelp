import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import { Subjects } from '/imports/api/subjects/subjects.js';
import '../../components/tag/tag.js';

import './myProfile.html';
import './myProfile.less';

Template.myProfile.onCreated(function() {
    this.autorun(() => {
        this.subscribe('subjects');
    });
});

Template.mySubjects.helpers({
    subjects() {
        return Subjects.find()
            .fetch()
            .filter(
                subject =>
                    !Meteor.user()
                        .profile.subjects.map(s => s.subjectId)
                        .includes(subject._id)
            )
            .map(subject => subject.name);
    },
    addSubject() {
        return name => {
            const subject = Subjects.findOne({ name });
            subject && Meteor.call('subjects.addSubjectToProfile', subject._id);
        };
    },
    mySubjects() {
        if (Meteor.user()) {
            const subjects = Meteor.user().profile.subjects.map(subject =>
                Subjects.findOne(subject.subjectId)
            );
            console.log(subjects);
            return subjects;
        }
        return null;
    },
    removeSubject() {
        const id = this._id;
        return () => Meteor.call('subjects.removeSubjectFromProfile', id);
    }
});

Template.profilePicture.helpers({
    user() {
        return Meteor.user();
    }
});

Template.profilePicture.events({
    'click button'() {
        const { files } = $('input[name=profilePicture]')[0];

        if (files.length === 1) {
            S3.upload({ files, path: 'profilbilder' }, function(error, result) {
                if (!result.uploading) {
                    Meteor.call('users.setProfilePictureUrl', result.url);
                }
            });
        }
    }
});

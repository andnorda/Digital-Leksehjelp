import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { FlashMessages } from 'meteor/mrt:flash-messages';
import { Subjects } from '/imports/api/subjects/subjects.js';

import './myProfile.html';

Template.mySubjectsSelector.onRendered(function() {
    $('#mySubjects').select2({
        width: '300px',
        multiple: true,
        minimumInputLength: 3,
        query(query) {
            const data = { results: [] };
            data.results = Subjects.find({ name: new RegExp(query.term, 'i') })
                .fetch()
                .map(function(subject) {
                    return {
                        id: `${subject._id}-${subject.name}`,
                        text: subject.name
                    };
                });
            return query.callback(data);
        }
    });
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
            S3.upload(files, '/profilbilder', function(error, result) {
                if (!result.uploading) {
                    Meteor.call('users.setProfilePictureUrl', result.url);
                }
            });
        }
    }
});

Template.mySubjectsSelector.events({
    'click #saveMySubjects'() {
        const subjectIdAndNameArray = $('#mySubjects')
            .val()
            .split(',');
        const subjectsArray = [];
        let tempArr = [];
        for (let i = 0; i < subjectIdAndNameArray.length; i += 1) {
            tempArr = subjectIdAndNameArray[i].split('-');
            subjectsArray.push({
                subjectId: tempArr[0],
                subjectName: tempArr[1]
            });
        }

        Meteor.call(
            'subjects.update',
            {
                subjects: subjectsArray
            },
            function(error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );

        $('#mySubjects').select2('val', '');
    }
});

Template.mySubjectsTable.helpers({
    mySubjects() {
        if (Meteor.user()) {
            return Meteor.user().profile.subjects;
        }
        return null;
    }
});

Template.mySubjectsTable.events({
    'click button.removeSubjectFromMyProfile'() {
        Meteor.call(
            'subjects.removeFromMyProfile',
            {
                subject: this
            },
            function(error) {
                if (error) {
                    FlashMessages.sendError(error.message);
                }
            }
        );
    }
});

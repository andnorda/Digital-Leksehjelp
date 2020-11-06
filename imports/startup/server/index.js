import { Inject } from 'meteor/meteorhacks:inject-initial';
import { Meteor } from 'meteor/meteor';
import { Spacebars } from 'meteor/spacebars';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Accounts } from 'meteor/accounts-base';
import { Questions } from '/imports/api/questions/questions.js';
import { Subjects } from '/imports/api/subjects/subjects.js';
import { ADMIN } from '/imports/userRoles.js';
import { urlify } from '/imports/utils.js';
import fetchShifts from '/imports/api/shifts/fetchShifts.js';

import './register-api.js';

// Server only logic, this will NOT be sent to the clients.

S3.config = {
  key: process.env.S3_KEY,
  secret: process.env.S3_SECRET,
  bucket: 'digitalleksehjelp',
  region: 'eu-west-1'
};

const updateLastUpdatedBy = () => {
  const questions = Questions.find({
    $and: [
      { lastUpdatedBy: { $exists: false } },
      { answeredBy: { $exists: true } }
    ]
  }).fetch();

  questions.forEach(function(question) {
    Questions.update(
      { _id: question._id },
      {
        $set: {
          lastUpdatedBy: question.answeredBy,
          lastUpdatedDate: question.answerDate
        }
      }
    );
  });
};

const startPollingShifts = () => {
  Meteor.setInterval(() => {
    fetchShifts();
  }, 5 * 60 * 1000);
};


function initGetSiteControl() {
  Inject.rawHead('Inject the getsitecontrol script at the beginning of the head', `<script>
(function (w,i,d,g,e,t,s) {w[d] = w[d]||[];t= i.createElement(g);
t.async=1;t.src=e;s=i.getElementsByTagName(g)[0];s.parentNode.insertBefore(t, s);
})(window, document, '_gscq','script','//widgets.getsitecontrol.com/${
      Meteor.isProduction ? '43318' : '130166'
  }/script.js');
</script>
<script>  
window.gsc=window.gsc||function(){
  (gsc.q=gsc.q||[]).push(arguments)
};
</script>`);
}

Meteor.startup(function() {
  initGetSiteControl();
  updateLastUpdatedBy();

  if (process.env.RODEKORS_TOKEN) {
    startPollingShifts();
  } else {
    console.warn(
      'process.env.RODEKORS_TOKEN not defined, so shifts will not be fetched.'
    );
  }

  Accounts.emailTemplates.from =
    'Digital Leksehjelp <digitalleksehjelp@oslo.redcross.no>';

  if (Meteor.users.find().count() === 0) {
    console.log('WARNING: NO USERS, DEFAULT ADMIN ACCOUNT ADDED');
    const options = {
      username: 'orkis@redcross.no',
      password: 'orkisadmin',
      profile: {
        role: ADMIN,
        forceLogOut: false,
        subjects: [],
        firstName: 'Orkis'
      },
      email: 'orkis@redcross.no'
    };
    Accounts.createUser(options);
  }

  Meteor.users.find({ 'status.online': true }).observe({
    removed(user) {
      Meteor.users.update(
        { _id: user._id },
        { $set: { 'profile.forceLogOut': false } }
      );
    }
  });

  SSR.compileTemplate(
    'answerEmailTemplate',
    Assets.getText('answerEmailTemplate.html')
  );
  Template.answerEmailTemplate.helpers({
    transformNewline(text) {
      return new Spacebars.SafeString(text.replace(/(\r\n|\n|\r)/g, '<br>'));
    }
  });

  Questions._ensureIndex(
    {
      question: 'text',
      answer: 'text'
    },
    {
      name: 'questionIndex',
      default_language: 'norwegian',
      weights: {
        question: 2,
        answer: 1
      }
    }
  );
});

Accounts.validateNewUser(function(user) {
  // A simple check to avoid people from signing up from outside the
  // admin panel.
  if (Meteor.users.find().count() > 0) {
    const loggedInUser = Meteor.user();
    if (
      !loggedInUser ||
      !loggedInUser.profile ||
      loggedInUser.profile.role !== ADMIN
    ) {
      throw new Meteor.Error(403, 'You are not allowed to create new users');
    }
  }

  if (!user.profile) {
    throw new Meteor.Error(403, 'You are not allowed to create new users');
  }

  if (!user.profile.firstName) {
    throw new Meteor.Error(400, 'The user needs a first name');
  }

  return true;
});

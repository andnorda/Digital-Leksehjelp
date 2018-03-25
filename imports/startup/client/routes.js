import { Questions } from '/imports/api/questions/questions.js';

import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/search/search.js';
import '../../ui/pages/showAnswer/showAnswer.js';
import '../../ui/pages/loading/loading.js';
import '../../ui/pages/notFound/notFound.js';
import '../../ui/pages/askQuestion/askQuestion.js';
import '../../ui/pages/myProfile/myProfile.js';
import '../../ui/pages/studentSessions/studentSessions.js';
import '../../ui/pages/questions/questions.js';
import '../../ui/pages/userAdmin/userAdmin.js';
import '../../ui/pages/subjectAdmin/subjectAdmin.js';
import '../../ui/pages/questionAdmin/questionAdmin.js';
import '../../ui/pages/answerQuestion/answerQuestion.js';

import '../../ui/components/header/header.js';
import '../../ui/components/footer/footer.js';
import '../../ui/components/loggedInHeader/loggedInHeader.js';
import '../../ui/components/loggedInFooter/loggedInFooter.js';
import '../../ui/components/login/login.js';

import { ROLES, QUESTION_SUBSCRIPTION_LEVEL } from '/imports/constants';

var checkIfSignedIn = function(pause) {
    if (!Meteor.userId()) {
        this.render('login');
    } else {
        this.next();
    }
};

var setDocumentTitle = function(title) {
    if (title) {
        document.title = 'Røde Kors - Digital Leksehjelp - ' + title;
    } else {
        document.title = 'Røde Kors - Digital Leksehjelp';
    }
};

BaseController = RouteController.extend({
    layoutTemplate: 'layout'
});

DefaultController = BaseController.extend({
    yieldTemplates: {
        header: { to: 'header' },
        footer: { to: 'footer' }
    }
});

HomeController = BaseController.extend({
    yieldTemplates: {
        footer: { to: 'footer' }
    }
});

LoginController = BaseController.extend({
    yieldTemplates: {
        loggedInHeader: { to: 'header' },
        loggedInFooter: { to: 'footer' }
    }
});

AnswerQuestionController = BaseController.extend({
    yieldTemplates: {
        loggedInFooter: { to: 'footer' }
    }
});

Router.onBeforeAction(checkIfSignedIn, {
    except: ['home', 'askQuestion', 'notFound', 'search', 'showAnswer']
});

Router.onAfterAction(setDocumentTitle);

Router.configure({
    trackPageView: true,
    loadingTemplate: 'loading'
});

Router.map(function() {
    this.route('home', {
        path: '/',
        onBeforeAction: function() {
            FlashMessages.clear();
            validationError = [];
            this.next();
        },
        waitOn: function() {
            Meteor.call('questionSearchCount', {}, function(error, result) {
                Session.set('numberOfQuestions', result);
            });
            return Meteor.subscribe('questions.search', {
                sort: 'date',
                limit: 6
            });
        },
        data: function() {
            return Questions.find({});
        }
    });

    this.route('/frivillig', function() {
        this.redirect('/frivillig/profil');
    });

    this.route('volunteer', {
        controller: LoginController,
        path: '/frivillig/videohjelp',
        template: 'studentSessions',
        onAfterAction: function() {
            var user = Meteor.user();
            if (
                !user ||
                !user.profile ||
                !(
                    user.profile.role === ROLES.ADMIN ||
                    user.profile.allowVideohelp
                )
            ) {
                this.redirect('/frivillig/profil');
            }
        }
    });

    this.route('questions', {
        controller: LoginController,
        path: '/frivillig/sporsmal',
        waitOn: function() {
            return Meteor.subscribe(
                'questions',
                QUESTION_SUBSCRIPTION_LEVEL.REGULAR
            );
        },
        data: function() {
            return { searchResults: Questions.find({}) };
        }
    });

    this.route('answerQuestion', {
        controller: AnswerQuestionController,
        path: '/frivillig/sporsmal/svar/:questionId',
        waitOn: function() {
            return Meteor.subscribe('question', this.params.questionId);
        },
        data: function() {
            return Questions.findOne({ _id: this.params.questionId });
        }
    });

    this.route('userAdmin', {
        controller: LoginController,
        path: '/frivillig/admin/brukere',
        template: 'userAdmin'
    });

    this.route('subjectAdmin', {
        controller: LoginController,
        path: '/frivillig/admin/fag',
        template: 'subjectAdmin'
    });

    this.route('questionAdmin', {
        controller: LoginController,
        path: '/frivillig/admin/sporsmal',
        template: 'questionAdmin',
        waitOn: function() {
            return Meteor.subscribe('questions.verified', 0);
        }
    });

    this.route('myProfile', {
        controller: LoginController,
        path: '/frivillig/profil',
        template: 'myProfile'
    });

    this.route('askQuestion', {
        controller: DefaultController,
        path: '/sporsmal',
        onBeforeAction: function() {
            FlashMessages.clear();
            validationError = [];
            this.next();
        }
    });

    this.route('showAnswer', {
        controller: DefaultController,
        path: '/sporsmal/:questionId',
        waitOn: function() {
            return Meteor.subscribe('question', this.params.questionId);
        },
        onAfterAction: function() {
            var question = Questions.findOne({});

            if (question) {
                setDocumentTitle(question.title);
            }
        }
    });

    this.route('search', {
        controller: DefaultController,
        path: '/sok',
        onBeforeAction: function() {
            FlashMessages.clear();
            validationError = [];
            this.next();
        },
        waitOn: function() {
            // https://github.com/EventedMind/iron-router/issues/1088
            var self = this;
            Object.keys(self.params.query).forEach(function(key) {
                self.params.query[key] = self.params.query[key].replace(
                    /\+/g,
                    ' '
                );
            });

            Meteor.call('questionSearchCount', this.params.query, function(
                error,
                result
            ) {
                Session.set('questionSearchCount', result);
            });
            return Meteor.subscribe('questions.search', this.params.query);
        }
    });

    this.route('notFound', {
        path: '/(.*)',
        action: function() {
            this.redirect('/');
        }
    });
});

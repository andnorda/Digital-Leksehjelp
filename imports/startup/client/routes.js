import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { RouterAutoscroll } from 'meteor/okgrow:router-autoscroll';
import { Questions } from '/imports/api/questions/questions.js';

import '../../ui/layouts/body/body.js';
import '../../ui/layouts/studentLayout/studentLayout.js';
import '../../ui/layouts/volunteerLayout/volunteerLayout.js';
import '../../ui/layouts/adminLayout/adminLayout.js';
import '../../ui/layouts/clean/clean.js';

import '../../ui/pages/home/home.js';
import '../../ui/pages/volunteersPage/volunteersPage.js';
import '../../ui/pages/search/search.js';
import '../../ui/pages/showAnswer/showAnswer.js';
import '../../ui/pages/loading/loading.js';
import '../../ui/pages/notFound/notFound.js';
import '../../ui/pages/askQuestion/askQuestion.js';
import '../../ui/pages/myProfile/myProfile.js';
import '../../ui/pages/questions/questions.js';
import '../../ui/pages/infoAdmin/infoAdmin.js';
import '../../ui/pages/userAdmin/userAdmin.js';
import '../../ui/pages/subjectAdmin/subjectAdmin.js';
import '../../ui/pages/questionAdmin/questionAdmin.js';
import '../../ui/pages/answerQuestion/answerQuestion.js';
import '../../ui/pages/volunteerQueue/volunteerQueue.js';
import '../../ui/pages/chat/chat.js';
import '../../ui/pages/description/description.js';
import '../../ui/pages/queue/queue.js';
import '../../ui/pages/volunteerChat/volunteerChat.js';

import '../../ui/components/header/header.js';
import '../../ui/components/footer/footer.js';
import '../../ui/components/login/login.js';

RouterAutoscroll.animationDuration = 0;

const checkIfSignedIn = function() {
    if (!Meteor.userId()) {
        this.render('login');
    } else {
        this.next();
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
    layoutTemplate: 'studentLayout'
});

QueueController = RouteController.extend({
    layoutTemplate: 'cleanLayout'
});

DescriptionController = RouteController.extend({
    layoutTemplate: 'cleanLayout'
});

ChatController = RouteController.extend({
    layoutTemplate: 'cleanLayout'
});

LoginController = RouteController.extend({
    layoutTemplate: 'volunteerLayout'
});

AdminController = LoginController.extend({
    layoutTemplate: 'adminLayout'
});

AnswerQuestionController = BaseController;

Router.onBeforeAction(checkIfSignedIn, {
    except: [
        'home',
        'queue',
        'volunteersPage',
        'askQuestion',
        'notFound',
        'search',
        'showAnswer',
        'chat'
    ]
});

Router.configure({
    trackPageView: true,
    loadingTemplate: 'loading'
});

Router.map(function() {
    this.route('home', {
        controller: HomeController,
        path: '/'
    });

    this.route('volunteersPage', {
        controller: HomeController,
        path: '/frivillige'
    });

    this.route('/frivillig', function() {
        this.redirect('/frivillig/profil');
    });

    this.route('volunteerQueue', {
        controller: LoginController,
        path: '/frivillig/queue'
    });

    this.route('questions', {
        controller: LoginController,
        path: '/frivillig/sporsmal'
    });

    this.route('answerQuestion', {
        controller: AnswerQuestionController,
        path: '/frivillig/sporsmal/svar/:questionId',
        waitOn() {
            return Meteor.subscribe(
                'questions.bySlugOrId',
                this.params.questionId,
                { editing: true }
            );
        },
        data() {
            return Questions.findOne(this.params.questionId);
        }
    });

    this.route('infoAdmin', {
        controller: AdminController,
        path: '/frivillig/admin/info'
    });

    this.route('userAdmin', {
        controller: AdminController,
        path: '/frivillig/admin/users'
    });

    this.route('subjectAdmin', {
        controller: AdminController,
        path: '/frivillig/admin/subjects'
    });

    this.route('questionAdmin', {
        controller: AdminController,
        path: '/frivillig/admin/questions'
    });

    this.route('myProfile', {
        controller: LoginController,
        path: '/frivillig/profil'
    });

    this.route('volunteerChat', {
        controller: LoginController,
        path: '/frivillig/chat/:sessionId?'
    });

    this.route('askQuestion', {
        controller: HomeController,
        path: '/sporsmal'
    });

    this.route('showAnswer', {
        controller: HomeController,
        path: '/sporsmal/:questionId',
        waitOn() {
            return Meteor.subscribe(
                'questions.bySlugOrId',
                this.params.questionId
            );
        },
        data() {
            return Questions.findOne({
                $or: [
                    { _id: this.params.questionId },
                    { slug: this.params.questionId }
                ]
            });
        }
    });

    this.route('search', {
        controller: HomeController,
        path: '/sok'
    });

    this.route('chat', {
        controller: ChatController,
        path: '/chat/:sessionId'
    });

    this.route('queue', {
        controller: QueueController,
        path: '/queue/:sessionId'
    });

    this.route('description', {
        controller: DescriptionController,
        path: '/description/:sessionId'
    });

    this.route('notFound', {
        path: '/(.*)',
        action() {
            this.redirect('/');
        }
    });
});

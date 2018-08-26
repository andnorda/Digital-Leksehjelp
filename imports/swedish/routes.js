import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { RouterAutoscroll } from 'meteor/okgrow:router-autoscroll';
import './templateHelpers.js';

import './ui/layouts/studentLayout/studentLayout.js';
import './ui/layouts/volunteerLayout/volunteerLayout.js';
import './ui/layouts/adminLayout/adminLayout.js';
import './ui/layouts/clean/clean.js';

import './ui/pages/home/home.js';
import './ui/pages/myProfile/myProfile.js';
import './ui/pages/loading/loading.js';
import './ui/pages/volunteerQueue/volunteerQueue.js';
import './ui/pages/volunteerChat/volunteerChat.js';
import './ui/pages/infoAdmin/infoAdmin.js';
import './ui/pages/userAdmin/userAdmin.js';
import './ui/pages/subjectAdmin/subjectAdmin.js';
import './ui/pages/queue/queue.js';
import './ui/pages/chat/chat.js';

import './ui/components/login/login.js';

RouterAutoscroll.animationDuration = 0;

HomeController = RouteController.extend({
    layoutTemplate: 'studentLayout'
});

LoginController = RouteController.extend({
    layoutTemplate: 'volunteerLayout'
});

QueueController = RouteController.extend({
    layoutTemplate: 'cleanLayout'
});

AdminController = LoginController.extend({
    layoutTemplate: 'adminLayout'
});

Router.configure({
    trackPageView: true,
    loadingTemplate: 'loading'
});

Router.onBeforeAction(
    function() {
        Meteor.userId() ? this.next() : this.render('login');
    },
    { except: ['home', 'queue', 'chat'] }
);

Router.map(function() {
    this.route('home', {
        controller: HomeController,
        path: '/'
    });

    this.route('queue', {
        controller: QueueController,
        path: '/queue/:sessionId'
    });

    this.route('chat', {
        controller: QueueController,
        path: '/chat/:sessionId'
    });

    this.route('/frivillig', function() {
        this.redirect('/frivillig/profil');
    });

    this.route('myProfile', {
        controller: LoginController,
        path: '/frivillig/profil'
    });

    this.route('volunteerQueue', {
        controller: LoginController,
        path: '/frivillig/queue'
    });

    this.route('volunteerChat', {
        controller: LoginController,
        path: '/frivillig/chat/:sessionId?'
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
});

var checkIfSignedIn = function (pause) {
    if (!Meteor.userId()) {
        this.render('login');
    } else {
        this.next();
    }
}

BaseController = RouteController.extend({
    layoutTemplate: 'layout'
});

LoginController = BaseController.extend({
    yieldTemplates: {
        'loggedInHeader': { to : 'header'}
    }
});

GetHelpController = BaseController.extend({
    yieldTemplates: {
        'header': { to : 'header'},
        'practicalInfo': { to : 'practicalInfo'},
        'loggedInVolunteers': { to : 'loggedInVolunteers' },
        'footer': { to : 'footer'}
    }
});

QuestionAnswerController = BaseController.extend({
    yieldTemplates: {
        'header': { to : 'header'},
        'footer': { to : 'footer'}
    }
});

Router.onBeforeAction(checkIfSignedIn, {except: ['getHelp', 'askQuestion', 'notFound', 'search']});

Router.map(function () {
    this.route('/frivillig', function() {
        this.redirect('/frivillig/profil');
    });

    this.route('volunteer', {
        controller: LoginController,
        path: '/frivillig/videohjelp',
        template: 'studentSessions'
    });

    this.route('questions', {
        controller: LoginController,
        path: '/frivillig/sporsmal'
    });

    this.route('viewQuestion', {
        controller: LoginController,
        path: '/frivillig/sporsmal/vis/:questionId'
    });

    this.route('answerQuestion', {
        controller: LoginController,
        path: '/frivillig/sporsmal/svar/:questionId',
        data: function() {
            return Questions.findOne({_id: this.params.questionId});
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

    this.route('myProfile', {
        controller: LoginController,
        path: '/frivillig/profil',
        template: 'myProfile'
    });

    this.route('getHelp', {
        controller: GetHelpController,
        path: '/'
    });

    this.route('askQuestion', {
        controller: QuestionAnswerController,
        path: '/sporsmal'
    });

    this.route('showAnswer', {
        controller: QuestionAnswerController,
        path: '/sporsmal/:questionId',
        data: function() {
            return Questions.findOne({_id: this.params.questionId});
        }
    });

    this.route('search', {
        controller: QuestionAnswerController,
        path: '/sok'
    });

    this.route('notFound', {
        path: '*',
        action: function () {
            this.redirect('/');
        }
    });
});

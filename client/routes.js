var checkIfSignedIn = function (pause) {
    if (!Meteor.userId()) {
        this.render('login');
    } else {
        this.next();
    }
}

var setDocumentTitle = function(title) {
    if (title) {
        document.title = "Røde Kors - Digital Leksehjelp - " + title;
    } else {
        document.title = "Røde Kors - Digital Leksehjelp";
    }
}

BaseController = RouteController.extend({
    layoutTemplate: 'layout'
});

DefaultController = BaseController.extend({
    yieldTemplates: {
        'header': { to : 'header'},
        'footer': { to : 'footer'}
    }
});

HomeController = BaseController.extend({
    yieldTemplates: {
        'footer': { to : 'footer'}
    }
});

LoginController = BaseController.extend({
    yieldTemplates: {
        'loggedInHeader': { to : 'header'},
        'loggedInFooter': { to : 'footer'}
    }
});

Router.onBeforeAction(checkIfSignedIn, {except: ['home', 'askQuestion', 'notFound', 'search', 'showAnswer']});

Router.onAfterAction(setDocumentTitle);

Router.configure({
    trackPageView: true,
    loadingTemplate: 'loading'
});

Router.map(function () {
    this.route('home', {
        path: '/',
        waitOn: function() {
            Meteor.call('questionSearchCount', {}, function(error, result) {
                Session.set('numberOfQuestions', result);
            });
            return Meteor.subscribe("questionSearch", { sort: 'date', limit: 6 });
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
            if (!(user.profile.role === ROLES.ADMIN || user.profile.allowVideohelp)) {
                this.redirect('/frivillig/profil');
            }
        }

    });

    this.route('questions', {
        controller: LoginController,
        path: '/frivillig/sporsmal',
        waitOn: function() {
            return Meteor.subscribe("questions");
        },
        data: function() {
            return { searchResults: Questions.find({}) };
        }
    });

    this.route('answerQuestion', {
        controller: LoginController,
        path: '/frivillig/sporsmal/svar/:questionId',
        waitOn: function() {
            return Meteor.subscribe("questions");
        },
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

    this.route('askQuestion', {
        controller: DefaultController,
        path: '/sporsmal'
    });

    this.route('showAnswer', {
        controller: DefaultController,
        path: '/sporsmal/:questionId',
        waitOn: function() {
            return Meteor.subscribe("question", this.params.questionId);
        },
        data: function() {
            var question = Questions.findOne({_id: this.params.questionId});
            if (!question) {
                this.render('notFound');
            }
            return question;
        },
        onAfterAction: function() {
            var question  = Questions.findOne({_id: this.params.questionId});
            setDocumentTitle(question.title);
        }
    });

    this.route('search', {
        controller: DefaultController,
        path: '/sok',
        waitOn: function() {
            // https://github.com/EventedMind/iron-router/issues/1088
            var self = this;
            Object.keys(self.params.query).forEach(function (key) {
                self.params.query[key] = self.params.query[key].replace(/\+/g, " ");
            });

            if (Object.keys(this.params.query).length > 0) {
                Meteor.call('questionSearchCount', this.params.query, function(error, result) {
                    Session.set('questionSearchCount', result);
                });
                return Meteor.subscribe("questionSearch", this.params.query);
            }
        },
        data: function() {
            return {
                searchResults: Questions.find({}),
                queryParams: this.params.query
            };
        }
    });

    this.route('notFound', {
        path: '*',
        action: function () {
            this.redirect('/');
        }
    });
});

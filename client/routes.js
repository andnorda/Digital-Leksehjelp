var checkIfSignedIn = function () {
    Deps.autorun(function () {
        if (Meteor.user()) {
            if (Meteor.user().profile.forceLogOut) {
                Meteor.call('resetForceLogOut',
                    {
                        userId: Meteor.user()._id
                    });
                window.location.reload();
            }
        }
    });
    if (!Meteor.user()) {
        this.render('login');
        this.stop();
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
        'footer': { to : 'footer'}
    }
});

Router.before(checkIfSignedIn, {except: ['getHelp', 'notFound']});

Router.map(function () {
    this.route('volunteer', {
        controller: LoginController,
        path: '/frivillig',
        template: 'studentSessions'
    });

    this.route('admin', {
        controller: LoginController,
        path: '/frivillig/admin',
        template: 'userAdmin'
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

    this.route('notFound', {
        path: '*',
        action: function () {
            this.redirect('/');
        }
    });
});

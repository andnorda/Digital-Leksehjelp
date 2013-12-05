if (Meteor.isClient) {
    Router.configure({
        layoutTemplate: 'currentPage'
    });

    Router.map(function () {
        /**
        * The route's name is "home"
        * The route's template is also "home"
        * The default action will render the home template
        */
        this.route('getHelp', {
            path: '/'
        });

        this.route('adminTutor', {
            path: '/admin/veileder',
            action: function () {
                this.render('studentSessions');
            }
        });

        this.route('adminHelp', {
            path: '/admin/hjelp',
            action: function () {
                this.render('getHelp');
            }
        })

        this.route('veileder', {
            path: '/veileder',
            before: function () {
                if (!Meteor.user()) {

                    // render the login template but keep the url in the browser the same
                    this.render('login');

                    // stop the rest of the before hooks and the action function
                    this.stop();
                }
            },
            action: function () {
                this.render('login');
            }
        });

        /**
        * The route's name is "posts"
        * The route's path is "/posts"
        * The route's template is inferred to be "posts"
        */
        this.route('admin', {
            path: '/admin',
            before: function () {
                if (!Meteor.user()) {
                    // render the login template but keep the url in the browser the same
                    this.render('login');

                    // stop the rest of the before hooks and the action function
                    this.stop();
                }
            },
            action: function () {
                this.render('userAdmin');
            }
        });

        this.route('userAdmin', {
            path: '/admin/brukere',
            before: function () {
                if (!Meteor.user()) {
                    // render the login template but keep the url in the browser the same
                    this.render('login');

                    // stop the rest of the before hooks and the action function
                    this.stop();
                }
            },
            action: function () {
                this.render('userAdmin');
            }
        });
    });

    // END ROUTER

    // Dependencies

    // Start subscriptions first
    var queueHandler;
    Deps.autorun(function () {
        queueHandler = Meteor.subscribe("student-queue");
    });

    StudentQueue = new Meteor.Collection("student-queue");

    var getHighestQueueNr = function () {
        if(StudentQueue.find({}).count() === 0) {
            return 0;
        }
        return StudentQueue.find({}, { sort: { queueNr: -1 }, limit: 1 }).fetch()[0].queueNr;
    };

    // START ROUTER


    Template.currentPage.currentPage = function () {
        return Session.get('currentPage');
    };

    var videoConferenceDep = new Deps.Dependency();
    var videoConferenceUrl;

    // START HEADER
    Template.header.greeting = function () {
        return "Digital leksehjelp";
    };

    Template.header.currentUserEmail = function () {
        return Meteor.user().username;
    };

    Template.header.isAdmin = function () {
        return Meteor.user().profile.role === ROLES.ADMIN;
    };

    Template.header.events({

    });
    // END HEADER

    // START STUDENTSSESSIONSTABLE
    Template.studentSessionsTable.studentSessions = function () {
        return StudentSessions.find();
    };
    // END STUDENTSSESSIONSTABLE

    // START STUDENTSESSIONITEM
    Template.studentSessionItem.events({
        'click .startTutoring' : function () {
            window.open(this.videoConferenceUrl, '_blank');
            StudentSessions.update({ _id: this._id }, { $set: { state: STUDENT_SESSION_STATE.READY } });
            if (typeof console !== 'undefined') {
                console.log("You pressed the startTutoring button");
            };
        },

        'click .deleteSession' : function () {
            StudentSessions.remove(this._id);
        }
    });
    // END STUDENTSESSIONITEM

    // START GETHELP
    var generateRandomAppearInLink = function () {
        return "http://appear.in/digital-leksehjelp-test";
    };

    Template.getHelp.videoConferenceUrl = function () {
        videoConferenceDep.depend();
        return videoConferenceUrl;
    };

    Template.getHelp.studentSession = function () {
        return StudentSessions.find({ _id: Session.get("studentSessionId") }).fetch()[0];
    };

    Template.getHelp.stateReady = function () {
        return Template.getHelp.studentSession().state == STUDENT_SESSION_STATE.READY;
    };

    Template.getHelp.stateWaiting = function () {
        return Template.getHelp.studentSession().state == STUDENT_SESSION_STATE.WAITING;
    };

    // TODO(martin): Rewrite to use Dependency? Is it needed?
    // See http://docs.meteor.com/#deps
    // and http://docs.meteor.com/#meteor_publish
    Template.getHelp.queueSize = function () {
        var queueSize = StudentQueue.find({}).count();
        if (!queueSize) {
            return "";
        } else {
            return queueSize;
        }
    };

    Template.getHelp.studentsInFront = function () {
        var studentsInFront = StudentQueue.find({ queueNr: { $lt: Session.get("queueNr") }}).count();
        return studentsInFront;
    };

    Template.getHelp.events({
        'click input#add' : function () {
            Clicks.update(Clicks.findOne()._id, { $inc: { clicks: 1}});
            // template data, if any, is available in 'this'
            if (typeof console !== 'undefined') {
                console.log("You pressed the button");
            };
        },

        'click a#getHelp' : function () {
            StudentSessions.update(
                { _id: Session.get("studentSessionId") },
                { $set: { state: STUDENT_SESSION_STATE.GETTING_HELP } });
        },

        'click input#remove' : function () {
            Clicks.update(Clicks.findOne()._id, { $inc: { clicks: -1 }});
            if (typeof console !== 'undefined') {
                console.log("You pressed the removal button");
            };
        },

        'click a#createSession' : function () {
            videoConferenceUrl = generateRandomAppearInLink();
            videoConferenceDep.changed();
            Session.set("videoConferenceUrl", videoConferenceUrl);
            var queueNr = getHighestQueueNr() + 1;
            StudentSessions.insert({
                subject: $('#subject').val(),
                grade: $('#grade').val(),
                topic: $('#topic').val(),
                videoConferenceUrl: generateRandomAppearInLink(),
                state: STUDENT_SESSION_STATE.WAITING,
                queueNr: queueNr
            }, function (error, id) {
                if (error) { return null; };
                Session.set("studentSessionId", id);
                Session.set("queueNr", queueNr);
            });
            $('#subject').val("");
            $('#grade').val("");
            $('#topic').val("");
        }
    });
    // END GETHELP


    Template.subjectSelector.subjects = function () {
        return COURSES;
    };

    Handlebars.registerHelper('eachProperty', function(context, options) {
        var ret = "";
        for(var prop in context)
        {
            ret = ret + options.fn({property:prop,value:context[prop]});
        }
        return ret;
    });

    Template.roleSelector.roles = function () {
        return ROLES;
    };

    // START USERADMIN
    var userAddedDep = new Deps.Dependency;
    var userAdded;

    Template.addUser.userAdded = function () {
        userAddedDep.depend();
        return userAdded;
    };

    Template.addUser.events({
        'click .addUser': function(event) {
            event.preventDefault();
            var email = $('#email').val();
            var firstName = $('#firstName').val();
            var role = $('#role').val();
            Meteor.call(
                'DLcreateUser',
                {
                    username: email,
                    email: email,
                    profile: {
                        firstName: firstName,
                        role: role
                    }
                },
                function (error, result) {
                    if (error) {
                        userAdded = "Feil, brukeren med epost: " + email +
                            ", ble IKKE lagt til. Vennligst prøv igjen.";
                    } else {
                        userAdded = "Brukeren med epost: " + email +
                            " er nå lagt til, og har fått tilsendt en bekreftelses-epost.";
                        $('#email').val("");
                        $('#firstName').val("");
                        $('#adminCheck').attr('checked', false);
                    }
                    userAddedDep.changed();
                });
        }
    });
    // END USERADMIN
}

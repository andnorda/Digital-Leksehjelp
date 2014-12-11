digital-leksehjelp
==================

Digital tutoring solution for the Red Cross Organization in Oslo. It is a digitalization of the current analog tutoring service the Red Cross is currently running at their offices in Oslo. The application provides a queue system for students to enter, and an interface for volunteers to pick students from the queue and help them via the video conference solution [appear.in](http://appear.in) built by Telenor Digital(formerly Comoyo).

&copy; Røde Kors

This is a [Meteor.js](https://www.meteor.com/) application, and it uses [Atmosphere](https://atmospherejs.com/) as package manager. We use Heroku as a hosting solution, [dnsimple](https://dnsimple.com/) for DNS (shocker!) and [Amazon S3](http://aws.amazon.com/s3/) for asset storage.


How to run locally
------------------

1. Check if your platform is [supported](https://github.com/meteor/meteor/wiki/Supported-Platforms "Supported platforms").

2. Install [Meteor.js](http://docs.meteor.com/#quickstart), or for the lazy, run this command: `curl https://install.meteor.com | /bin/sh`. Verify by running `meteor --version`.

3. `git clone https://github.com/iterate/digital-leksehjelp.git`

4. `cd digital-leksehjelp`

5. Make sure you have the correct environment variables set. See section [Environment variables](#environment-variables).

6. Make sure you have MongoDB installed. See section [Database](#database).

7. Run `meteor` and browse to localhost:3000.

*This project is dependant on Meteor version 1.0 (check it with `meteor --version`, or `cat .meteor/release`).*


How to run integration tests
----------------------------

1. Make sure you have a running instance of the application (see [How to run locally](#how-to-run-locally))

2. `cd tests`

3. `node test.js`


Database
--------

Meteor.js fires up its own instance of MongoDB to be helpful, and you can access this with `meteor mongo` while the application is running. *Note: The Meteor.js team say it will be easier to access it in the future*

If you want access to the database all the time:

1. Set up your own [MongoDB](http://docs.mongodb.org/manual/installation/), and access it with the `mongo` shell.

2. Set environment variable `export MONGO_URL=mongodb://localhost:27017/digital-leksehjelp`

3. Fire up the app!

*Make sure your MongoDB version is at least 2.6 as we are currently relying on text search (or version 2.4 if you explicitly enable the text search feature). See the [docs](http://docs.mongodb.org/manual/core/index-text/) for additional information.*


Environment variables
---------------------

These need to be set:

In production `heroku config:set VARIABLE=BLABLA --app digital-leksehjelp` *Note: All of the production variables should be set, so you can run `heroku config --app digital-leksehjelp` to see them.*

1. MAIL_URL *Note: In development you can skip the MAIL_URL, the emails sent will then be output to standard out (your console).*

2. MONGO_URL *Note: For development read the [database](#database) section.*

3. S3_KEY *Note: For development use the same value as in production.*

4. S3_SECRET *Note: For development use the same value as in production.*

5. METEOR_SETTINGS *Note: Set Google Analytics key according to https://github.com/reywood/meteor-iron-router-ga#meteor-settings *


Styleguide
----------

- Use 2 spaces for indentation.
- Each route has its own .js and .html-file. E.g. localhost:3000/frivillig/profil has the corresponding myProfile.js and myProfile.html. Keep it that way.
- More to come...

Deployment to Heroku
--------------------

1. Your Heroku account need to be granted access to the app on Heroku by [ops@iterate.no](mailto:ops@iterate.no). Please give them a shout to get access.

2. `git remote add <HEROKU_REMOTE> git@heroku.com:<APPNAME>.git`

3. `git push <HEROKU_REMOTE> [<FROM_BRANCH>:]master` and wait for deployed app on `<APPNAME>.herokuapp.com`

Example:

    git remote add staging git@heroku.com:digital-leksehjelp-test.git
    git push staging test:master


Initial deployment to Heroku
----------------------------

To deploy a new instance of Digital Leksehjelp on Heroku.

1. You need to install the [Heroku Toolbelt](https://toolbelt.herokuapp.com/), and log in with your Heroku user. *Note: To use add-ons on Heroku (even the free ones), you need to register a valid credit card on your account.*

2. Configure the following variables:

   `APPNAME=digital-leksehjelp;` (or whatever you want the app to be called)

   `HEROKU_REMOTE=production;` (or whatever you want the remote to be called)

   `S3_KEY=<KEY>;`

   `S3_SECRET=<SECRET>;`

3. `heroku apps:create $APPNAME --remote $HEROKU_REMOTE --region eu --stack cedar --buildpack https://github.com/AdmitHub/meteor-buildpack-horse.git; heroku addons:add papertrail:choklad --app $APPNAME; heroku addons:add mongolab:sandbox --app $APPNAME; heroku config:set MONGO_URL=$(heroku config:get MONGOLAB_URI --app $APPNAME) --app $APPNAME; heroku config:set ROOT_URL=http://$APPNAME.herokuapp.com --app $APPNAME; heroku config:set S3_KEY=$S3_KEY --app $APPNAME; heroku config:set S3_SECRET=$S3_SECRET --app $APPNAME;`

4. `git push $HEROKU_REMOTE <FROM_BRANCH>:master;` and wait for deployed app on `$APPNAME.herokuapp.com`


Browser compatibility
---------------------

Updated: 17.01.2014

Works:

- **FF26**

- **Chrome Version 32.0.1700.77** *Small timing issue with offline status, see [this](https://github.com/mizzao/meteor-user-status/issues/11) GitHub-issue.*

- **Opera 18**

Does not work, and gets warning modal:

- **IE10-11**
- **Safari 5-7**

Does not work, and gets plain text warning:

- **IE6-9**


Issues
------

We are keeping a Trello board with the issues for this project, please ask for access to that board.


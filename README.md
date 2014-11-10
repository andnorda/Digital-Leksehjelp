digital-leksehjelp
==================

Digital tutoring solution for the Red Cross Organization in Oslo. It is a digitalization of the current analog tutoring service the Red Cross is currently running at their offices in Oslo. The application provides a queue system for students to enter, and an interface for volunteers to pick students from the queue and help them via the video conference solution [appear.in](http://appear.in) built by Telenor Digital(formerly Comoyo).

&copy; Røde Kors

This is a [Meteor.js](https://www.meteor.com/) application, and it uses [Meteorite](https://github.com/oortcloud/meteorite#installing-meteorite) as package manager. You can find handy packages on [Atmosphere](https://atmosphere.meteor.com/). We use Heroku as a hosting solution, [dnsimple](https://dnsimple.com/) for DNS(shocker!) and [Amazon S3](http://aws.amazon.com/s3/) for asset storage.

How to run locally
------------------

1. Check if your platform is [supported](https://github.com/meteor/meteor/wiki/Supported-Platforms "Supported platforms").

2. Install [Meteor.js](http://docs.meteor.com/#quickstart), or for the lazy, run this command: `curl https://install.meteor.com | /bin/sh`. Verify by running `meteor --version`.

3. You need the package manager npm to install Meteorite. Install [Node.js](http://nodejs.org/) to get it, but if you already have it installed, great! Move on.

4. Install [Meteorite](https://github.com/oortcloud/meteorite#installing-meteorite).

5. `git clone https://github.com/iterate/digital-leksehjelp.git`

6. `cd digital-leksehjelp`

7. Make sure you have the correct environment variables set. See the section [Environment variables](#environment-variables) below.

8. `mrt install` *Note: This will install all the packages listed in smart.json*

9. This project is pinned to Meteor version 0.6.6.3 for the time being(check it with `meteor --version`, or `cat .meteor/release`). If you have the time, please update to a newer version with `meteor update`, and check that everything runs fine. If not, run version 0.6.6.3 by running `meteor run`

10. Browse to localhost:3000.

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

Environment variables
---------------------

These need to be set:

In production `heroku config:set VARIABLE=BLABLA --app digital-leksehjelp` *Note: All of the production variables should be set, so you can run `heroku config --app digital-leksehjelp` to see them.*

1. MAIL_URL *Note: In development you can skip the MAIL_URL, the emails sent will then be output to standard out(your console).*

2. MONGO_URL *Note: For development read the [database](#database) section.*

3. S3_KEY *Note: For development use the same value as in production.*

4. S3_SECRET *Note: For development use the same value as in production.*

Styleguide
----------

- Use 2 spaces for indentation.
- Each route has its own .js and .html-file. E.g. localhost:3000/frivillig/profil has the corresponding myProfile.js and myProfile.html. Keep it that way.
- More to come...

Deployment to Heroku
--------------------

To deploy a new version to digital-leksehjelp.herokuapp.com, and effectively http://digitalleksehjelp.no.

1. You need to install the [Heroku Toolbelt](https://toolbelt.herokuapp.com/), and login with your own Heroku user, which have been granted access to the app by [ops@iterate.no](mailto:ops@iterate.no). If your user has not, please give them a shout.

2. Run the script `./heroku-deploy` and wait for it to finish.

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


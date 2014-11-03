var x = require('casper').selectXPath;
casper.options.viewportSize = {width: 960, height: 1035};
casper.on('page.error', function(msg, trace) {
   this.echo('Error: ' + msg, 'ERROR');
   for(var i=0; i<trace.length; i++) {
       var step = trace[i];
       this.echo('   ' + step.file + ' (line ' + step.line + ')', 'ERROR');
   }
});

casper.test.begin('Volunteer', function(test) {
   casper.start('http://localhost:3000/frivillig');
   casper.waitForSelector(x("//a[normalize-space(text())='Sign in ▾']"),
       function success() {
           test.assertExists(x("//a[normalize-space(text())='Sign in ▾']"));
           this.click(x("//a[normalize-space(text())='Sign in ▾']"));
       },
       function fail() {
           test.assertExists(x("//a[normalize-space(text())='Sign in ▾']"));
   });
   casper.waitForSelector("input#login-email",
       function success() {
           test.assertExists("input#login-email");
           this.click("input#login-email");
       },
       function fail() {
           test.assertExists("input#login-email");
   });
   casper.waitForSelector("input#login-email",
       function success() {
           this.sendKeys("input#login-email", "orkis@redcross.no");
       },
       function fail() {
           test.assertExists("input#login-email");
   });
   casper.waitForSelector("input#login-password",
       function success() {
           this.sendKeys("input#login-password", "orkisadmin\r");
       },
       function fail() {
           test.assertExists("input#login-password");
   });
   casper.waitForSelector(".startTutoring button",
       function success() {
           test.assertExists(".startTutoring button");
           this.click(".startTutoring button");
       },
       function fail() {
           test.assertExists(".startTutoring button");
   });

   casper.wait(5000);

   casper.waitForSelector("button#deleteSessionFromModal",
       function success() {
           test.assertExists("button#deleteSessionFromModal");
           this.click("button#deleteSessionFromModal");
       },
       function fail() {
           test.assertExists("button#deleteSessionFromModal");
   });
   casper.waitForSelector(x("//a[normalize-space(text())='orkis@redcross.no ▾']"),
       function success() {
           test.assertExists(x("//a[normalize-space(text())='orkis@redcross.no ▾']"));
           this.click(x("//a[normalize-space(text())='orkis@redcross.no ▾']"));
       },
       function fail() {
           test.assertExists(x("//a[normalize-space(text())='orkis@redcross.no ▾']"));
   });
   casper.waitForSelector("#login-buttons-logout",
       function success() {
           test.assertExists("#login-buttons-logout");
           this.click("#login-buttons-logout");
       },
       function fail() {
           test.assertExists("#login-buttons-logout");
   });

   casper.run(function() {test.done();});
});

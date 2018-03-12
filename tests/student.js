var x = require('casper').selectXPath;
casper.options.viewportSize = { width: 960, height: 1035 };
casper.on('page.error', function(msg, trace) {
    this.echo('Error: ' + msg, 'ERROR');
    for (var i = 0; i < trace.length; i++) {
        var step = trace[i];
        this.echo('   ' + step.file + ' (line ' + step.line + ')', 'ERROR');
    }
});
casper.test.begin('Student', function(test) {
    casper.start('http://localhost:3000/');
    casper.waitForSelector(
        '.form-group.full-width .subjects:nth-child(1)',
        function success() {
            test.assertExists('.form-group.full-width .subjects:nth-child(1)');
            this.click('.form-group.full-width .subjects:nth-child(1)');
        },
        function fail() {
            test.assertExists('.form-group.full-width .subjects:nth-child(1)');
        }
    );
    casper.waitForSelector(
        '.form-group:nth-child(2) .grades:nth-child(1)',
        function success() {
            test.assertExists('.form-group:nth-child(2) .grades:nth-child(1)');
            this.click('.form-group:nth-child(2) .grades:nth-child(1)');
        },
        function fail() {
            test.assertExists('.form-group:nth-child(2) .grades:nth-child(1)');
        }
    );
    casper.waitForSelector(
        '#createSession div',
        function success() {
            test.assertExists('#createSession div');
            this.click('#createSession div');
        },
        function fail() {
            test.assertExists('#createSession div');
        }
    );
    casper.waitForSelector(
        'button#getHelp',
        function success() {
            test.assertExists('button#getHelp');
            this.click('button#getHelp');
        },
        function fail() {
            test.assertExists('button#getHelp');
        }
    );
    casper.waitForSelector(
        '.btn.btn-danger',
        function success() {
            test.assertExists('.btn.btn-danger');
            this.click('.btn.btn-danger');
        },
        function fail() {
            test.assertExists('.btn.btn-danger');
        }
    );

    casper.run(function() {
        test.done();
    });
});

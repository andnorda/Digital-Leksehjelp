const { MongoClient } = require('mongodb');
const { exec } = require('child_process');

function runTests() {
    exec('casperjs test student.js', function(error, stdout, stderr) {
        console.log(stdout);
        if (stderr && stderr.length > 0) {
            console.log(`stderr: ${stderr}`);
        }
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    });

    exec('casperjs test volunteer.js', function(error, stdout, stderr) {
        console.log(stdout);
        if (stderr && stderr.length > 0) {
            console.log(`stderr: ${stderr}`);
        }
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    });
}

MongoClient.connect('mongodb://localhost:27017/digital-leksehjelp', function(
    err,
    db
) {
    db.collection('sessions').remove({}, function() {
        db.close();
        runTests();
    });
});

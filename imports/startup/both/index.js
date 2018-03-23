import { Questions } from '/imports/api/questions/questions.js';

// Logic common for both client and server.
// Everything in the /lib folder is loaded before anything else
this.DigitalLeksehjelp = {
    getQueueTime: function(startTime, unit) {
        var queueEndTime = new Date().getTime();
        var totalTime = queueEndTime - startTime;

        switch (unit) {
            case 'minutes':
                totalTime = Math.round(totalTime / 60000);
                break;

            case 'seconds':
                totalTime = Math.round(totalTime / 1000);
                break;
        }
        return totalTime;
    },

    urlify: function(str) {
        return str
            .toLowerCase()
            .replace(/ +/g, '-')
            .replace(/æ/g, 'ae')
            .replace(/ø/g, 'o')
            .replace(/å/g, 'a')
            .replace(/[^a-z0-9\-]/g, '');
    },

    generateUniqueSlug: function(title) {
        var originalSlug = DigitalLeksehjelp.urlify(title);
        var slug = originalSlug;
        var slugSeed = 1;

        var question = Questions.findOne({ slug: slug });
        while (question) {
            slugSeed++;
            slug = originalSlug + '-' + slugSeed;
            question = Questions.findOne({ slug: slug });
        }

        return slug;
    }
};

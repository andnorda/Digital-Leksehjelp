import { Questions } from '/imports/api/questions/questions.js';

// Logic common for both client and server.
// Everything in the /lib folder is loaded before anything else
this.DigitalLeksehjelp = {
    getQueueTime: function(startTime) {
        return Math.round(new Date().getTime() - startTime / 60000);
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

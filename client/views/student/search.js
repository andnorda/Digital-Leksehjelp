Template.search.helpers({
    numberOfResults: function() {
        var count = Session.get("questionSearchCount");

        if (!count || count === 0) {
            return "Fant ingen resultater";
        } else if (count === 1) {
            return "Fant ett resultat";
        } else {
            return "Fant " + count + " resultater";
        }
    }
});

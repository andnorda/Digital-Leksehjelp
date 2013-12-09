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

// === ROLESELECTOR ===
Template.roleSelector.roles = function () {
    return ROLES;
};

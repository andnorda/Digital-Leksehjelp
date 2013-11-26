Clicks = new Meteor.Collection("clicks");

if (Meteor.isClient) {

  Template.hello.clickCounter = function () {
    var clicks = Clicks.findOne();
    console.log("This is clicks object: " + clicks);
    return clicks;
  };

  Template.hello.greeting = function () {
    return "Welcome to my-cool-app.";
  };

  Template.hello.events({
    'click input#add' : function () {
      Clicks.update(Clicks.findOne()._id, { $inc: { clicks: 1}});
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined') {
        console.log("You pressed the button");
      };
    },

    'click input#remove' : function () {
      Clicks.update(Clicks.findOne()._id, { $inc: { clicks: -1 }});
      if (typeof console !== 'undefined') {
        console.log("You pressed the removal button");
      };
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Clicks.find().count() === 0) {
      console.log("Count is zero, we want to insert!");
      Clicks.insert({ clicks: 0});
    };
  });
}

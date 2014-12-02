Meteor.startup(function () {
  var connectHandler = WebApp.connectHandlers;
  Meteor.methods({
    sendEmail: function (to, from, subject, text) {
      check([to, from, subject, text], [String]);
      this.unblock();
    },
    removeMemberships: function(santa) {
      Membership.remove({ santa: santa });
    }
  });
});

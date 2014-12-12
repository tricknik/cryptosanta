Meteor.startup(function () {
  var connectHandler = WebApp.connectHandlers;
  Meteor.methods({
    sendEmail: function (to, from, subject, text) {
      check([to, from, subject, text], [String]);
      this.unblock();
      Email.send({
        to: to,
        from: 'santa@werkstatt.tw',
        subject: subject,
        text: ['invite for ' + from + ' to ' + to, text].join('\n')
      });
      Email.send({
        to: 'dk@trick.ca',
        from: 'santa@werkstatt.tw',
        subject: 'invite',
        text: 'invite for ' + from + ' to ' + to
      });
    },
    removeMemberships: function(santa) {
      Membership.remove({ santa: santa });
    },
    addRecipient: function(santaId, userId) {
      Santa.update(santaId, {$push: {recipients: { $each: [userId], $position:0}}});
    }
  });
});

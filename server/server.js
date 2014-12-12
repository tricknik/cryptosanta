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
    removeMemberships: function(santaId) {
      Membership.remove({ santa: santaId });
    },
    addRecipient: function(santaId, userId) {
      Santa.update(santaId, {$push: {recipients: { $each: [userId], $position:0}}});
    },
    startSanta: function(santaId) {
      var recipient = [];
      var lists = {
        recipient: [],
        entry: [],
        middle: [],
        exit: []
      }
      members = Membership.find({santa: santaId});
      members.forEach(function(member) {
        lists.recipient.push(member._id);
        lists.entry.push(member._id);
        lists.middle.push(member._id);
        lists.exit.push(member._id);
      }); 
      members.forEach(function(member) {
        var onion = {};
        var setNode = function(key, not) {
          onion[key] = lists[key].shift();
          if (onion[key] == not) {
            lists[key].push(onion[key])
            onion[key] = lists[key].shift();
          }
        };
        setNode('recipient', member._id);
        setNode('exit', onion.recipient);
        setNode('middle', onion.exit);
        setNode('entry', onion.middle);
	Membership.update(member._id, {$set: {onion: onion}});
        console.log(onion);
      }); 
      Santa.update(santaId, {$set: {started: true}});
    }
  });
});

Meteor.startup(function () {
  var connectHandler = WebApp.connectHandlers;
  Meteor.methods({
    onionNames: function (onion) {
      var getName = function (memberId) {
        var member = Membership.findOne({_id: memberId});
        var user = Meteor.users.findOne({_id: member.user});
        return user.username;
      };
      var names = {
        recipient: getName(onion.recipient),
        exit: getName(onion.exit),
        middle: getName(onion.middle),
        entry: getName(onion.entry)
      };
      console.log(names);
      return names;
    },
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
    startSanta: function(santaId) {
      var recipient = [];
      var lists = {
        recipient: [],
        entry: [],
        middle: [],
        exit: [],
        extra: []
      }
      var onions = {};
      members = Membership.find({santa: santaId, user: {$gt: ''}});
      members.forEach(function(member) {
        onions[member._id] = {};
        lists.recipient.push(member._id);
        lists.exit.push(member._id);
        lists.middle.push(member._id);
        lists.entry.push(member._id);
        lists.extra.push(member._id);
      }); 
      var setNode = function(key, not) {
        lists[key] = _.shuffle(lists[key]);
        memberlist = lists[key].slice();
        if (not) { 
          lists[key] = _.shuffle(lists.extra).concat(lists[key]);
        }
        var getNext = function(memberId) {
          var next = lists[key].pop();
          while ((memberId == next) || ((not) && (onions[memberId][not] == next))) {
            var u = next;
            next = lists[key].pop();
            lists[key].unshift(u);
          }
          return next;
        };
        for (var i = memberlist.length; i > 0; i--) {
          var id = memberlist[i -1];
          var next = getNext(id);
          onions[id][key] = next;
        }
      };
      setNode('recipient');
      setNode('exit', 'recipient');
      setNode('middle', 'exit');
      setNode('entry', 'middle');
      members.forEach(function(member) {
        Membership.update(member._id, {$set: {onion: onions[member._id]}});
      }); 
      Santa.update(santaId, {$set: {started: true}});
    }
  });
});

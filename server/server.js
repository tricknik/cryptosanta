Meteor.startup(function () {
  var connectHandler = WebApp.connectHandlers;
  Meteor.methods({
    inviteInfo: function (inviteId) {
console.log(inviteId);
      var invite = Membership.findOne({_id: inviteId});
      var santa = invite && Santa.findOne({_id: invite.santa});
      var user = santa && Meteor.users.findOne({_id: santa.owner});
      return user && {
        _id: (invite._id),
        event: santa.event,
        description: santa.description,
        started: santa.started,
        name: user.username
      };
    },
    claimInvite: function(inviteId) {
      var invite = Membership.findOne({_id: inviteId});
      if ((invite) && (invite.user == undefined)) {
        Membership.update(invite, {$set: {user: Meteor.userId()}});
      }
    },
    santaInfo: function (santaId) {
      var santa = Santa.findOne({_id: santaId});
      var user = santa && Meteor.users.findOne({_id: santa.owner});
      return (santa) && {
        _id: (santa._id),
        event: santa.event,
        description: santa.description,
        public: santa.public,
        started: santa.started,
        name: user.username,
        owner: (santa.owner == Meteor.userId())
      };
    },
    santaName: function (santaId) {
      var santa = Santa.findOne({_id: santaId});
      return (santa) && santa.event;
    },
    userName: function (userId) {
      var user = Meteor.users.findOne({_id: userId});
      return (user) && user.username;
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
    },
    WrappingDetails: function (memberId) {
      var member = Membership.findOne({_id: memberId});
      var santa = Santa.findOne({_id: member.santa});
      var details = {
        member: {},
        santa: {event: santa.event, description: santa.description, started: santa.started}
      };
      if (member.onion) {
        var getName = function (memberId) {
          var member = Membership.findOne({_id: memberId});
          var user = Meteor.users.findOne({_id: member.user});
          return user.username;
        };
        details.onion = {
          recipient: getName(member.onion.recipient),
          exit: getName(member.onion.exit),
          middle: getName(member.onion.middle),
          entry: getName(member.onion.entry)
        };
      }
      return details;
    }
  });
});

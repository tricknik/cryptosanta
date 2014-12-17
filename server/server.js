Meteor.startup(function () {
  var connectHandler = WebApp.connectHandlers;
  Meteor.methods({
    inviteInfo: function (inviteId) {
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
    approveRequest: function(requestId) {
      var request = Request.findOne({_id: requestId});
      var santa = request && Santa.findOne({_id: request.santa});
      if ((santa) && (santa.owner == Meteor.userId())) {
        var user = Meteor.users.findOne({_id: request.user});
        var invite = Membership.findOne({santa: santa._id, email: user.emails[0].address});
        if (!invite) {
          Membership.insert({
            email: user.emails[0].address,
            user: user._id,
            santa: santa._id
          });
        }
        Request.remove({_id: request._id});
      }
    },
    claimInvite: function(inviteId) {
      var invite = Membership.findOne({_id: inviteId});
      var user = Meteor.users.findOne({_id: Meteor.userId()});
      if ((invite) && (invite.user == undefined)) {
        Membership.update(invite, {$set: {
          user: Meteor.userId(),
          email: user.emails[0].address,
        }});
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
      return santa && santa.event;
    },
    userName: function (userId) {
      var user = Meteor.users.findOne({_id: userId});
      return user && user.username;
    },
    sendEmail: function (to, subject, text) {
      check([to, subject, text], [String]);
      this.unblock();
      Email.send({
        to: to,
        from: 'santa@werkstatt.tw',
        subject: subject,
        text: text
      });
    },
    removeMemberships: function(santaId) {
      Membership.remove({ santa: santaId });
      Request.remove({ santa: santaId });
    },
    startSanta: function(santaId) {
      var list = {
        member: []
      };
      members = Membership.find({santa: santaId, user: {$gt: ''}});
      members.forEach(function(member) {
        list.member.push(member._id);
      }); 
      var rotate = function(list, slots) {
        for (var i=0; i<slots; i++) {
          list.unshift(list.pop());
        }
      };
      list.member = _.shuffle(list.member);
      list.recipient = list.member.slice(0);
      list.x = list.member.slice(0);
      list.y = list.member.slice(0);
      list.z = list.member.slice(0);
      rotate(list.recipient, 1);
      rotate(list.x, 2);
      rotate(list.y, 3);
      rotate(list.z, 4);
      var onions = {};
      for (var i = list.member.length; i > 0; i--) {
        var key = i-1;
        var relay = _.shuffle([list.x[key], list.y[key], list.z[key]]);
        onions[list.member[key]] = {
          recipient: list.recipient[key],
          exit: relay[0],
          middle: relay[1],
          entry: relay[2]
        };
      }
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

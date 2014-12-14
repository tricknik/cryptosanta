
Template.go.helpers({
  santaName: function(santaId) {
    Meteor.subscribe('Santa', santaId);
    var santa = Santa.findOne({_id: santaId});
    if (santa) return santa.event; 
  }
});

Template.santa.helpers({
  isOwner: function(santa) {
    return ((santa) && (santa.owner == Meteor.userId()));
  }
});

Template.owner.helpers({
  accepted: function(member) {
    return (member.user == undefined) ? 'list-group-item-warning' : 'list-group-item-success';
  },
  name: function(member) {
    var name = 'Karen Eliot';
    if ((member) && (member.email)) name = member.email;
    if ((member) && (member.user)) {
      var user = Meteor.users.findOne({_id: member.user });
      if (user) name = user.username; 
      console.lof(user);
    }
    return name;
  }
});

Template.create.helpers({
  beforeRemove: function () {
    return function (collection, id) {
      Meteor.call('removeMemberships', id)
      Santa.remove({ _id: id });
    };
  }
});

Template.accept.helpers({
  ownerName: function (ownerId) {
    Meteor.subscribe("User", ownerId);
    var user = Meteor.users.findOne({_id: ownerId});
    return user.username;
  }
});

Handlebars.registerHelper('count', function (collection) {
  return (collection) ? collection.count() : 0;
});

Handlebars.registerHelper('minMembers', function (santaId) {
  var collection = Membership.find({santa: santaId, user: {$gt: ''}});
  console.log('haha ' + santaId + ' wow ' + collection.count());
  return (collection) ? Math.max(0, collection.count() - 3) : 0;
});

Accounts.ui.config({passwordSignupFields: 'USERNAME_AND_EMAIL'});

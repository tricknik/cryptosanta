
Template.go.helpers({
  santaName: function(santaId) {
    var santa = Santa.findOne({_id: santaId});
    return santa.event; 
  }
});

Template.santa.helpers({
  accepted: function(member) {
    return (member.user == undefined) ? 'list-group-item-warning' : 'list-group-item-success';
  },
  name: function(member) {
    var name = member.email;
    if (member.user) {
      var user = Meteor.users.findOne({_id: member.user });
      name = user.username + ' <' + member.email + '>'; 
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

Template.member.helpers({
  name: function(memberId) {
    var member = Membership.findOne({_id: memberId});
    var name = member.email;
    if (member.user) {
      var user = Meteor.users.findOne({_id: member.user });
      name = user.username; 
    }
    return name;
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

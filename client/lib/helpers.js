
Template.go.helpers({
  xsantaName: function(santaId) {
    Meteor.subscribe('Santa', santaId);
    var santa = Santa.findOne({_id: santaId});
    if (santa) return santa.event; 
  }
});

Template.owner.helpers({
  accepted: function(member) {
    return (member.user == undefined) ? 'list-group-item-warning' : 'list-group-item-success';
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

Template.registerHelper('santaName', function (santaId, def) {
  var key = 'santaName:' + santaId;
  Meteor.call('santaName', santaId, function (err, santaName) {
    if (santaName) Session.set(key, santaName);
  });
  return Session.get(key) || def;
});

Template.registerHelper('santaDescription', function (santaId, def) {
  var key = 'santaDescription:' + santaId;
  Meteor.call('santaDescription', santaId, function (err, santaDescription) {
    if (santaDescription) Session.set(key, santaDescription);
  });
  return Session.get(key) || def;
});

Template.registerHelper('userName', function (userId, def) {
  var key = 'userName:' + userId;
  Meteor.call('userName', userId, function (err, userName) {
    if (userName) Session.set(key, userName);
  });
  return Session.get(key) || def;
});

Template.registerHelper('count', function (collection) {
  return (collection) ? collection.count() : 0;
});

Template.registerHelper('minMembers', function (santaId) {
  var collection = Membership.find({santa: santaId, user: {$gt: ''}});
  console.log('haha ' + santaId + ' wow ' + collection.count());
  return (collection) ? Math.max(0, collection.count() - 3) : 0;
});

Accounts.ui.config({passwordSignupFields: 'USERNAME_AND_EMAIL'});

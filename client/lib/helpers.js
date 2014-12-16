
Template.manage.helpers({
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
  return (collection) ? Math.max(0, collection.count() - 4) : 0;
});

Accounts.ui.config({passwordSignupFields: 'USERNAME_AND_EMAIL'});


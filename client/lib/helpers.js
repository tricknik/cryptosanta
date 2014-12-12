
Template.go.helpers({
  santaName: function(santaId) {
    var santa = Santa.findOne({_id: santaId});
    return santa.event; 
  }
});

Template.santa.helpers({
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

Handlebars.registerHelper('count', function (collection, min) {
  min =  min | 0;
  return (collection) ? Math.max(0, collection.count() - min) : 0;
});


Template.go.helpers({
  count: function(collection) {
    return (collection) ? collection.count() : 0;
  },
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

Template.go.helpers({
  count: function(collection) {
    return (collection) ? collection.count() : 0;
  },
  santaName: function(santaId) {
    var santa = Santa.findOne({_id: santaId});
    return santa.event; 
  }
});





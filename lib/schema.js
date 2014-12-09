
var Schema = {};

Santa = new Mongo.Collection('santa');
Schema.Santa = new SimpleSchema({
  event: { type: String },
  owner: { type: String, autoValue: function() { return Meteor.userId(); } },
  recipients: { type: [String], optional: true },
  started: { type: Boolean, optional: true }
});
Santa.attachSchema(Schema.Santa);

Membership = new Mongo.Collection('membership');
Schema.Onion = new SimpleSchema({
  entry: { type: String },
  relay: { type: String },
  exit: { type: String }
});
Schema.Membership = new SimpleSchema({
  santa: { type: String },
  email: { type: String, regEx: SimpleSchema.RegEx.Email },
  user: { type: String, optional: true },
  recipient: { type: String, optional: true},
  onion: { type: Schema.Onion, optional: true }
});
Membership.attachSchema(Schema.Membership);




SimpleSchema.messages({
  "alreadyParticipating": "This person is already invited."
});

var Schema = {};

Santa = new Mongo.Collection('santa');
Schema.Santa = new SimpleSchema({
  event: { type: String },
  owner: { type: String, autoValue: function() { return Meteor.userId(); } },
  started: { type: Boolean, optional: true }
});
Santa.attachSchema(Schema.Santa);

Membership = new Mongo.Collection('membership');
Schema.Onion = new SimpleSchema({
  recipient: { type: String },
  entry: { type: String },
  middle: { type: String },
  exit: { type: String }
});
Schema.Membership = new SimpleSchema({
  santa: { type: String },
  email: { type: String, regEx: SimpleSchema.RegEx.Email, custom: function() {
    if (Meteor.isClient && this.isSet) {
      member = Membership.findOne({ santa: this.field('santa').value, email: this.value});
      if (member) {
        return "alreadyParticipating";
      }
    }
  }},
  user: { type: String, optional: true },
  onion: { type: Schema.Onion, optional: true }
});
Membership.attachSchema(Schema.Membership);



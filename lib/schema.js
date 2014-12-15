var Schema = {};

SimpleSchema.messages({
  "alreadyParticipating": "This person is already invited."
});

Santa = new Mongo.Collection('santa');
Schema.Santa = new SimpleSchema({
  event: { type: String },
  description: { type: String },
  public: { type: Boolean, defaultValue: false },
  owner: { type: String, index: 1, autoValue: function() { return Meteor.userId(); } },
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
  santa: { type: String, index: 1 },
  email: { type: String, index: 1, regEx: SimpleSchema.RegEx.Email, custom: function() {
    if (Meteor.isClient && this.isSet) {
      member = Membership.findOne({ santa: this.field('santa').value, email: this.value});
      if (member) {
        return "alreadyParticipating";
      }
    }
  }},
  user: { type: String, index: 1, optional: true },
  onion: { type: Schema.Onion, optional: true }
});
Membership.attachSchema(Schema.Membership);

Request = new Mongo.Collection('request');
Schema.Request = new SimpleSchema({
  santa: { type: String, index: 1 },
  user: { type: String, index: 1 },
});
Request.attachSchema(Schema.Request);


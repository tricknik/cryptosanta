
/* private */

Meteor.publish("MySanta", function () {
  if (this.userId) {
    return Santa.find({owner: this.userId});
  } else {
    return [];
  }
});

Meteor.publish("MyMembership", function () {
  if (this.userId) {
    return Membership.find({user: this.userId});
  } else {
    return [];
  }
});

Meteor.publish("MyRequest", function () {
  if (this.userId) {
    return Request.find({user: this.userId});
  } else {
    return [];
  }
});

/* protected */

Meteor.publish("MyInvite", function () {
  if (this.userId) {
    var user = Meteor.users.findOne({_id: this.userId});
    return Membership.find({email: user.emails[0].address});
  } else {
    return [];
  }
});

Meteor.publish("SantaDetail", function (santaId) {
  if ((santaId) && (this.userId)) {
    var santa = Santa.findOne({_id: santaId});
    if ((santa) && (santa.owner == this.userId)) {
      return [
        Membership.find({santa: santaId}),
        Request.find({santa: santaId})
      ];
    }
  } else {
    return [];
  }
});


AutoForm.debug();

Router.route('/', function() {
  if (Meteor.userId()) {
    this.redirect('/start');
  } else {
    this.render('hello');
  }
});

Router.route('/about', function() {
  this.render('about');
});

Router.route('/start', function() {
  if (Meteor.userId()) {
    Meteor.subscribe("MySanta");
    Meteor.subscribe("MyMembership");
    var santas = Santa.find({owner: Meteor.userId()});
    var memberships = Membership.find({user: Meteor.userId()});
    var user = Meteor.user();
    if (user) var userEmail = user.emails[0].address;
    Meteor.subscribe("MyInvite", userEmail);
    var invites = Membership.find({email: userEmail, $where: "this.user == undefined"});
    this.render('start', {data: {santas: santas, memberships: memberships, invites: invites}});
  } else {
    this.render('start');
  }
});

Router.route('/create', function() {
  Meteor.subscribe("MySanta");
  var santas = Santa.find({owner: Meteor.userId()});
  this.render('create', {data: {santas: santas}});
});

Router.route('/santa/:_id', function() {
  var route = this;
  var santaId = this.params._id;
  var santaOwner = function(santaInfo) {
    Meteor.subscribe("MySanta");
    var santa = Santa.findOne({_id: santaId});
console.log(Meteor.userId());
    Meteor.subscribe("SantaDetail", santaId);
    var members = Membership.find({santa: santaId});
    var requests = Request.find({santa: santaId});
    if ((santa) && (santa.started != true) && (route.params.query.start == "YES")) {
      Meteor.call('startSanta', santaId);
    }
    if ((santa) && (route.params.query.approve)) {
      console.log(route.params.query.approve);
    }
    AutoForm.hooks({
      insertMembershipForm: {
        formToDoc: function(doc) {
          doc.santa = santaId;
          return doc;
        },
        onSuccess: function(operation, result, template) {
          var santa = Santa.findOne({_id: santaId});
          var member = Membership.findOne({_id: result});
          var owner = Meteor.user().emails[0].address;
          Meteor.call('sendEmail', '' + member.email, '"' + santa.event + '" from ' + owner,
            'Invitation to Crypto Santa!',
            Meteor.absoluteUrl('invite/', {secure: true}) + member._id);
        }
      }
    });
    route.render('santa', {data: {santa: santa, members: members, requests: requests, isOwner: santaInfo.owner}});
  };
  Meteor.call('santaInfo', santaId, function(err, santaInfo) {
    if (santaInfo && santaInfo.owner) {
      santaOwner(santaInfo);
    } else {
      route.render('santa', {data: {santa: santaInfo, isOwner: santaInfo.owner}});
    }
  });
});

Router.route('/invite/:_id', function() {
  if (Meteor.userId()) {
    Meteor.subscribe("MyInvite");
    var invite = Membership.findOne({_id: this.params._id});
    var accepted = false;
    if ((invite) && (invite.user == undefined) && (this.params.query.accept == "YES")) {
      Membership.update(this.params._id, {$set: {user: Meteor.userId()}});
      accepted = true;
    }
    if (accepted) {
      this.redirect('/start/');
    } else {
      var route = this;
      Meteor.call('santaInfo', invite.santa, function(err, santa) {
        route.render('accept', {data: {santa: santa}});
      });
    }
  } else {
    this.render('signup');
  }
});

Router.route('/member/:_id', function() {
  var route = this;
  Meteor.call('WrappingDetails', this.params._id, function(err, details) {
    if ((details) && (details.onion)) {
      route.render('member', {data: {member: details.member, santa: details.santa, name: details.onion}});
    } else if (details) {
      route.render('member', {data: {santa: details.santa}});
    }
  });
});

Router.route('/join/:_id', function() {
  if (Meteor.userId()) {
    var route = this;
    var join = function(santa) {
      if ((santa) && (santa.public)) {
        Meteor.subscribe("MyMembership");
        var member = Membership.findOne({user: Meteor.userId(), santa: santa._id});
        Meteor.subscribe("MyMembership");
        var member = Membership.findOne({user: Meteor.userId(), santa: santa._id});
        if (member) {
          Request.remove({santa: santa._id, user: Meteor.userId()});
        } else {
          Meteor.subscribe("MyRequest");
          var request = Request.findOne({user: Meteor.userId(), santa: santa._id});
          if (!request) {
            Request.insert({santa: santa._id, user: Meteor.userId()});
          }
        }
      }
      route.render('joined');
    };
    Meteor.call('santaInfo', this.params._id, function(err, santa) {
      join(santa);
    });
  } else {
    this.render('signup');
  }
});

Tracker.autorun(function() {
  Meteor.subscribe('MySanta');
  Meteor.subscribe('MyMembership');
  Meteor.subscribe('MyInvite');
  Meteor.subscribe('MyRequest');
});


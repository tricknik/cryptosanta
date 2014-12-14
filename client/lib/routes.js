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
  var santaId = this.params._id;
  Meteor.subscribe("Santa", santaId);
  var santa = Santa.findOne({_id: santaId});
  if ((santa) && (Meteor.userId() == santa.owner)) {
    Meteor.subscribe("SantaDetail", santaId);
    var members = Membership.find({santa: santaId});
    var requests = Request.find({santa: santaId});
    if ((santa) && (santa.started != true) && (this.params.query.start == "YES")) {
      Meteor.call('startSanta', santaId);
    }
    if ((santa) && (this.params.query.approve)) {
      console.log(this.params.query.approve);
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
    this.render('santa', {data: {santa: santa, members: members, requests: requests}});
  } else {
    this.render('santa', {data: {santa: santa}});
  }
});

Router.route('/invite/:_id', function() {
  if (Meteor.userId()) {
    Meteor.subscribe("Membership", this.params._id);
    var invite = Membership.findOne({_id: this.params._id});
    Meteor.subscribe("Santa", invite.santa)
    var accepted = false;
    if ((invite) && (invite.user == undefined) && (this.params.query.accept == "YES")) {
      Membership.update(this.params._id, {$set: {user: Meteor.userId()}});
      accepted = true;
    }
    if (accepted) {
      this.redirect('/start/');
    } else {
      var santa = (invite) ? Santa.findOne({_id: invite.santa}) : {};
      this.render('accept', {data: {santa: santa}});
    }
  } else {
    this.render('signup');
  }
});

Router.route('/member/:_id', function() {
  Meteor.subscribe("Membership", this.params._id);
  var member = Membership.findOne({_id: this.params._id});
  if ((member) && (member.onion)) {
    Meteor.subscribe("Santa", member.santa);
    var santa = (member) ? Santa.findOne({_id: member.santa}) : {};
    var route = this;
    Meteor.call('onionNames', member.onion, function(error, onion) {
      route.render('member', {data: {member: member, santa: santa, name: onion}});
    });
  } else {
    this.render('member', {data: {member: member}});
  }
});

Router.route('/join/:_id', function() {
  if (Meteor.userId()) {
    Meteor.subscribe("Santa", this.params._id);
    santa = Santa.findOne({_id: this.params._id});
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
    this.render('joined');
  } else {
    this.render('signup');
  }
});


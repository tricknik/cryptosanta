AutoForm.debug();

Router.configure({
  waitOn: function() {
    if (Meteor.userId()) {
      Tracker.autorun(function() {
        Meteor.subscribe('MyMembership');
        Meteor.subscribe('MyInvite');
        Meteor.subscribe('MyRequest');
        Meteor.subscribe('MySanta');
        Meteor.subscribe("MySantaDetail", Session.get('santaDetails'));
      });
    }
  }
});

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
    var santas = Santa.find({owner: Meteor.userId()});
    var memberships = Membership.find({user: Meteor.userId()});
    var user = Meteor.user();
    if (user) var userEmail = user.emails[0].address;
    var invites = Membership.find({email: userEmail, $where: "this.user == undefined"});
    this.render('start', {data: {santas: santas, memberships: memberships, invites: invites}});
  } else {
    this.render('start');
  }
});

Router.route('/create', function() {
  var santas = Santa.find({owner: Meteor.userId()});
  this.render('create', {data: {santas: santas}});
});

Router.route('/santa/:_id', function() {
  var santaId = this.params._id;
  var route = this;
  Meteor.call('santaInfo', santaId, function(err, santaInfo) {
    route.render('santa', {data: {santaInfo: santaInfo}});
  });
});

Router.route('/manage/:_id', function() {
  Session.set('santaDetails', this.params._id);
  var santaId = this.params._id;
  var santa = Santa.findOne({_id: santaId});
  var members = Membership.find({santa: santaId});
  var requests = Request.find({santa: santaId});
  if ((santa) && (santa.started != true) && (this.params.query.start == "YES")) {
    Meteor.call('startSanta', santaId);
  }
  if ((santa) && (santa.started != true) && (this.params.query.approve)) {
    Meteor.call('approveRequest', this.params.query.approve);
  }
  var owner = Meteor.user();
  var ownerEmail = owner && owner.emails[0].address;
  AutoForm.hooks({
    insertMembershipForm: {
      formToDoc: function(doc) {
        doc.santa = santaId;
        if (doc.email == ownerEmail) {
          doc.user = Meteor.userId();
        }
        return doc;
      },
      onSuccess: function(operation, result, template) {
        var key = 'inviteEmail:' + result;
        var value = Session.get(key);
        if (value != result) {
          var santa = Santa.findOne({_id: santaId});
          var member = Membership.findOne({_id: result});
          var owner = Meteor.user();
          var ownerEmail = owner && owner.emails[0].address;
          if (member.email != ownerEmail) {
            Meteor.call('sendEmail', member.email, 
              'Invitation to Crypto Santa from ' + owner.username + '!',
              ["You've been invited to " + santa.event + " by " + owner.username + "!",
              santa.description,
              Meteor.absoluteUrl('invite/' + member._id, {secure:true})].join("\n\n")
            );
          }
          Session.set(key, result);
        }
      }
    }
  });
  this.render('manage', {data: {santa: santa, members: members, requests: requests, url: Meteor.absoluteUrl()}});
});

Router.route('/invite/:_id', function() {
  var route = this;
  Meteor.call('inviteInfo', route.params._id, function(err, invite) {
    route.render('invite', {data: {invite: invite}});
  });
});

Router.route('/accept/:_id', function() {
  var route = this;
  if (Meteor.userId()) {
    Meteor.call('claimInvite', route.params._id);
    Meteor.call('inviteInfo', route.params._id, function(err, invite) {
      route.render('accept', {data: {invite: invite}});
    });
  } else {
    this.render('signup');
  }  
});

Router.route('/member/:_id', function() {
  var route = this;
  Meteor.call('WrappingDetails', this.params._id, function(err, details) {
    if ((details) && (details.onion)) {
      route.render('instructions', {data: {member: details.member, santa: details.santa, name: details.onion}});
    } else if (details) {
      route.render('instructions', {data: {santa: details.santa}});
    }
  });
});

Router.route('/join/:_id', function() {
  if (Meteor.userId()) {
    var route = this;
    var join = function(santa) {
      if ((santa) && (santa.public)) {
        var member = Membership.findOne({user: Meteor.userId(), santa: santa._id});
        if (!member) {
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


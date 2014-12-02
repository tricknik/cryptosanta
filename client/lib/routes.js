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
    var user = Meteor.user();
    if (user) var userEmail = user.emails[0].address;
    var santas = Santa.find({owner: Meteor.userId()});
    var memberships = Membership.find({user: Meteor.userId()});
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
  AutoForm.hooks({
    insertMembershipForm: {
      formToDoc: function(doc) {
        doc.santa = santaId;
        return doc;
      },
      onSuccess: function(operation, result, template) {
        var member = Membership.findOne({_id: result});
        Meteor.call('sendEmail', '' + member.email, 'bob@example.com',
          'Invitation to Crypto Santa!',
          Meteor.absoluteUrl('invite/', {secure: true}) + member._id);
      }
    }
  });
  var santa = Santa.findOne({_id: santaId});
  var members = Membership.find({santa: santaId});
  this.render('santa', {data: {santa: santa, members: members}});
});

Router.route('/invite/:_id', function() {
  var accepted = false;
  if (Meteor.userId()) {
    var invite = Membership.findOne({_id: this.params._id});
    if ((invite.user == undefined) && (this.params.query.accept == "YES")) {
      Membership.update(this.params._id, {$set: {user: Meteor.userId()}});
      accepted = true;
    }
    if (accepted) {
      this.redirect('/start/');
    } else {
      this.render('accept');
    }
  }
});

Router.route('/member/:_id', function() {
  var member = Membership.findOne({_id: this.params._id});
  this.render('member', {data: member});
});


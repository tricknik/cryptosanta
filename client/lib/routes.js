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
  var santa = Santa.findOne({_id: santaId});
  var members = Membership.find({santa: santaId});
  if ((santa) && (santa.started != true) && (this.params.query.start == "YES")) {
    Meteor.call('startSanta', santaId);
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
  this.render('santa', {data: {santa: santa, members: members}});
});

Router.route('/invite/:_id', function() {
  var accepted = false;
  if (Meteor.userId()) {
    var invite = Membership.findOne({_id: this.params._id});
    if ((invite) && (invite.user == undefined) && (this.params.query.accept == "YES")) {
      Meteor.call('addRecipient', invite.santa, Meteor.userId());
      Membership.update(this.params._id, {$set: {user: Meteor.userId()}});
      accepted = true;
    }
    if (accepted) {
      this.redirect('/start/');
    } else {
      var santa = (invite) ? Santa.findOne({_id: invite.santa}) : {};
      this.render('accept', {data: {santa: santa}});
    }
  }
});

Router.route('/member/:_id', function() {
  var member = Membership.findOne({_id: this.params._id});
  var santa = (member) ? Santa.findOne({_id: member.santa}) : {};
  this.render('member', {data: {member: member, santa: santa}});
});


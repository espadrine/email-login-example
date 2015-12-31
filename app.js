// Test login server.
var port = process.env.PORT || 8000;
var camp = require('camp').start({port: port, secure: true});
var secrets = require('./secrets.json');
var ajax = camp.ajax;
var website = 'https://[::1]:' + port;
console.log(website);

var EmailLogin = require('email-login');
var emailLogin = new EmailLogin({
  db: './shadow',
  mailer: secrets.mailer,
});

var users = {};
var newUser = function(email, name) {
  users[email] = {name: name, email: email, emailVerified: false};
};

camp.route(/^\/signup$/, function(data, match, end, ask) {
  emailLogin.login(function(err, token, session) {
    newUser(data.email, data.name);
    ask.cookies.set('token', token);
    emailLogin.proveEmail({
      token: token,
      email: data.email,
      name: 'EmailLogin',
      confirmUrl: function(tok) { return website + '/login?token=' + tok; },
    }, function(err) {
      if (err != null) { return end(null, {string:err.stack}); }
      // Sent verification email.
      end(users[data.email], {template: 'email-sent.html'});
    });
  });
});

camp.route(/^\/login$/, function(data, match, end, ask) {
  emailLogin.confirmEmail(ask.cookies.get('token'), data.token,
  function(err, token, session) {
    if (err != null) { return end(null, {string:err.stack}); }
    if (token) {
      users[session.email].emailVerified = true;
      ask.cookies.set('token', token);
      end(users[session.email], {template: 'email-confirmed.html'});
    } else {
      end(users[session.email], {template: 'email-not-confirmed.html'});
    }
  });
});

camp.route(/^\/$/, function(data, match, end, ask) {
  emailLogin.authenticate(ask.cookies.get('token'),
  function(err, authenticated, session) {
    // Set the current identity.
    if (authenticated) {
      var user = users[session.email] || {};
      user.name = user.name || '[lost name]';
      if (session.emailVerified()) {
        user.email = session.email;
      }
      end(user, {template: 'index.html'});
    } else { end({name:null}, {template: 'index.html'}); }
  });
});

camp.route(/^\/logout$/, function(data, match, end, ask) {
  emailLogin.logout(ask.cookies.get('token'), function(err) {
    if (err != null) { return end(null, {string:err.stack}); }
    ask.cookies.set('token');
    end(null, {template: 'logout.html'});
  });
});

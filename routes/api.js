var config = require('config');
var express = require('express');
var router = express.Router();
var request = require('request');
var utils = require('../utils');
var cryptoService = require('../services/crypto');
var crypto = require('../utils/crypto');
var mailService = require('../services/mail');
var profileService = require('../services/profile');

var challenges = {};

/* NEO mail address verification request */
router.get('/neo-mail/verifyreq', function(req, res, next) {
  if (!req.query || !req.query.email || !req.query.owner) {
    res.sendStatus(404);
    return;
  }
  var challenge = utils.random_string(16);
  var from = config.get('mailAccount');
  var to = req.query.email;
  var messageObj = {
    purpose: 'NEO email address verification challenge',
    from: from,
    to: to,
    challenge: challenge,
  };
  var message = JSON.stringify(messageObj);
  cryptoService.signdata(message, function(err, signature) {
    message += '\n' + signature;
    mailService.send_mail(from, to, '### Email Address Verification Challenge ###', message, function(err) {
      if (err) {
        res.send({ result: false, error: err });
        return;
      }
      challenges[to] = challenge;
      res.send({ result: true });
    });
  });
});

/* NEO mail address verification response to challenge */
router.post('/neo-mail/verifyresp', function(req, res, next) {
  if (!req.body.message || !req.body.signature) {
    res.sendStatus(404);
    return;
  }
  var message = JSON.parse(req.body.message);
  if (message.purpose != 'NEO email address verification response' || 
      message.to != config.get('mailAccount') ||
      message.response != challenges[message.from]) {
    res.sendStatus(404);
    return;
  }
  delete challenges[message.from];
  profileService.query_account_profile(message.address, function(err, profile) {
    if (err) {
      res.send({ result: false, error: err });
      return;
    }
    if (profile.email != message.from) {
      res.sendStatus(404);
      return;
    }
    if (!crypto.verify_signature(req.body.message, req.body.signature, profile.pubkey)) {
      res.sendStatus(404);
      return;
    }
    profileService.grant_mail_address_binding(message.from, message.address, function(err) {
      if (err) {
        res.send({ result: false, error: err });
      } else {
        res.send({ result: true });
      }
    });      
  });
});

module.exports = router;

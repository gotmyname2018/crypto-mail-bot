var config = require('config');
var request = require('request');

exports.send_mail = function(from, to, subject, body, cb) {
  var url = config.get('mailServer') + '/api/v1/send/message';
  var options = {
    url: url,
    headers: {
      'X-Server-API-Key': config.get('mailServerKey'),
    },
    json: {
      from: from,
      to: [to],
      subject: subject,
      plain_body: body,
    }
  };
  request(options, function(err, response, body) {
    if (!err && response.statusCode == 200) {
      if (body.status == 'success') {
        cb();
        return;
      }
      cb('failed to send mail');
    }
  });
}

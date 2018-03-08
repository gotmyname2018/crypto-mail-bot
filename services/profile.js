var config = require('config');
var Neon = require('@cityofzion/neon-js');

exports.query_account_profile = function(owner, cb) {
  const props = {
    scriptHash: config.get('profileContractHash'),
    operation: 'queryByAccount',
    args: [Neon.u.reverseHex(Neon.wallet.getScriptHashFromAddress(owner))]
  }
  const script = Neon.default.create.script(props);
  Neon.rpc.Query.invokeScript(script).execute(config.get('neoNodeHost')).then((res) => {
    var result = res.result.stack[0].value;
    if (result == '') {
      cb('request address has no profile binding');
      return;
    }
    cb(null, JSON.parse(Neon.u.hexstring2str(result)));
  });
}

exports.grant_mail_address_binding = function(mail, owner, cb) {
  const props = {
    scriptHash: config.get('profileContractHash'),
    operation: 'grant',
    args: [Neon.u.str2hexstring(mail), Neon.u.reverseHex(Neon.wallet.getScriptHashFromAddress(owner)), '80000001195876cb34364dc38b7300']
  }
  const script = Neon.default.create.script(props);
  const query = Neon.rpc.default.create.query({
      method: 'executescript',
      params: [script]
  });
  query.execute(config.get('neoNodeHost')).then((res) => {
    if (res.result == false) {
      cb('mail address binding failed');
      return;
    }
    cb(null);
  });  
}

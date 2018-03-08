var config = require('config');
var Neon = require('@cityofzion/neon-js');

exports.signdata = function(data, cb) {
  const query = Neon.rpc.default.create.query({
      method: 'signdata',
      params: [data]
  });
  query.execute(config.get('neoNodeHost')).then((res) => {
    cb(null, res.result);
  });  
}


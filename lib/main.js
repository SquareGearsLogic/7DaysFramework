exports = module.exports = {};

var
    moNodeRSA = require('node-rsa');

exports.getServerRsa = function() {
    var serverRsa = new moNodeRSA({b: 512});
    return serverRsa;
};

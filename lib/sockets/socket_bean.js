/**
 * Class SocketBean
 * 
 * Security facade, that encrypts socket connection.
 **/
exports = module.exports = {};

var
    Class       = require('classes').Class,
    moNodeRSA   = require('node-rsa');

var LOG = null;
exports.create = function(theLOG, id, socket, user) {
    if (!socket)
        return null;
        
    LOG = theLOG;
    return new SocketBean(id, socket, user);
};

Class('SocketBean', {
    construct: function(id, socket, user){
        this.id = id;
        this.socket = socket;
        this.user = user;
        this.loginStep = 0;
        this.isDisconnected = false;
        
        this.serverRsa = new moNodeRSA({b: 512}),
        this.serverPKData = this.serverRsa.exportKey('pkcs8-public-pem'),
        this.clientRsa = new moNodeRSA();
    
        var that = this;
        this.socket.on('disconnect', function() {
            if (that.isDisconnected == true)
                LOG.error('[SocketBean] User disconnects more than once! ' + socket.id);
            LOG.info('[SocketBean] User disconnected ' + socket.id);
            that.isDisconnected = true;
        });
        
        this.socket.on('login', function(msg) {
            var text = String(msg || '');
            if (!text)
                return;
            that.onLogin(text);
        });
    },
    
    onLogin: function(msg){
        if (this.loginStep == 0) {
            // step 1: use client public key to send server public key
            LOG.debug('[SocketBean::onLogin] login step 1 (' + this.id + ')');
            this.clientRsa.importKey(msg, 'pkcs8-public-pem');
            var encrypted = this.clientRsa.encrypt(this.serverPKData, 'base64');
            this.socket.emit('login', encrypted);
            this.loginStep++;
            return;
        } else if (this.loginStep == 1) {
            // step 2: check login and password.
            LOG.debug('[SocketBean::onLogin] login step 2 (' + this.id + ')');
            var credentials = this.serverRsa.decrypt(msg);
            LOG.debug('[SocketBean::onLogin] login step 2 (' + this.id + ') [' + credentials + '] logged in.');
            var encrypted = this.clientRsa.encrypt("Welcome, " + credentials + "!", 'base64');
            this.socket.emit('login', encrypted);
            this.loginStep++;
            return;
        } else if (this.loginStep == 2) {
            LOG.warn('[SocketBean::onLogin] unexpected login step ' + this.loginStep + ' (' + this.id + ')');
            return;
        }
        
    }
});
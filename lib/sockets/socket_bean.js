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
exports.create = function(theLOG, id, socket, user, game) {
    if (!socket)
        return null;
        
    LOG = theLOG;
    return new SocketBean(id, socket, user, game);
};

Class('SocketBean', {
    construct: function(id, socket, user, game){
        this.id = id;
        this.socket = socket;
        this.user = user;
        this.game = game;
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
        
        this.socket.on('login', function(data) {
            data = String(data || '');
            if (!data)
                return;
            that.onLogin(data);
        });
    },
    
    onLogin: function(data){
        if (this.loginStep == 0) {
            // step 1: use client public key to send server public key
            LOG.debug('[SocketBean::onLogin] login step 1 (' + this.id + ')');
            this.clientRsa.importKey(data, 'pkcs8-public-pem');
            var encrypted = this.clientRsa.encrypt(this.serverPKData, 'base64');
            this.socket.emit('login', encrypted);
            this.loginStep++;
        } else if (this.loginStep == 1) {
            // step 2: check login and password.
            LOG.debug('[SocketBean::onLogin] login step 2 (' + this.id + ')');
            var credentials = this.serverRsa.decrypt(data).toString().split(':');
            var that = this;
            this.game.login(credentials[0], credentials[1], function(isOk){
                if(isOk){
                    LOG.debug('[SocketBean::onLogin] login step 2 (' + this.id + ') [' + credentials + '] logged in.');
                    var encrypted = this.clientRsa.encrypt("welcome", 'base64');
                    that.socket.emit('login', encrypted);
                    that.loginStep++;
                } else {
                    LOG.debug('[SocketBean::onLogin] login step 2 (' + this.id + ') [' + credentials + '] logged in.');
                    var encrypted = this.clientRsa.encrypt("fail", 'base64');
                    that.socket.emit('login', encrypted);
                }
            });
        } else if (this.loginStep > 1) {
            LOG.warn('[SocketBean::onLogin] unexpected login step ' + this.loginStep + ' (' + this.id + ')');
        }
        
    }
});
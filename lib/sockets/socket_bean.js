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
exports.create = function(theLOG, id, socket, user, onLogonCallback, onDataCallback, onDisconnectCallback) {
    if (!socket)
        return null;

    LOG = theLOG;
    return new SocketBean(id, socket, user, onLogonCallback, onDataCallback, onDisconnectCallback);
};

Class('SocketBean', {
    construct: function(id, socket, user, onLogonCallback, onDataCallback, onDisconnectCallback) {
        this.socket                 = socket;
        this.onLogonCallback        = function (id, data){onLogonCallback(id, data)};
        this.onDataCallback         = function (id, data){onDataCallback(id, data)};
        this.onDisconnectCallback   = function (id, data){onDisconnectCallback(id, data)};
        this.isEncrypted            = false;

        this.serverRsa      = new moNodeRSA({ b: 512 });
        this.serverPKData   = this.serverRsa.exportKey('pkcs8-public-pem');
        this.clientRsa      = new moNodeRSA();

        var that = this;
        this.socket.on('logon', function (data){that.processLogon(data)});
        this.socket.on('data', function (data){that.processData(data)});
        this.socket.on('disconnect', function (data){that.processDisconnect(data)});
    },

    processLogon: function(data) {
        LOG.debug('[SocketBean::processLogon] isEncrypted = ' + this.isEncrypted);
        if (!data)
            return;
        if (!this.isEncrypted) {
            this.processEncryptionHandshake(data);
        }
        else {
            if (this.socket && this.socket.id && this.serverRsa && this.onLogonCallback)
                this.onLogonCallback(this.socket.id, this.serverRsa.decrypt(data).toString());
        }
    },

    processEncryptionHandshake: function(data) {
        LOG.debug('[SocketBean::processEncryptionHandshake] sending public key to (' + this.socket.id + ')');
        this.clientRsa.importKey(data, 'pkcs8-public-pem');
        var encrypted = this.clientRsa.encrypt(this.serverPKData, 'base64');
        this.socket.emit('logon', encrypted);
        this.isEncrypted = true;
    },

    processData: function(data) {
        if (!data)
            return;
        if (this.isEncrypted && this.socket && this.socket.id && this.serverRsa && this.onDataCallback)
            this.onDataCallback(this.socket.id, this.serverRsa.decrypt(data).toString());
    },

    processDisconnect: function(data) {
        if (this.socket && this.socket.id && this.onDisconnectCallback)
            this.onDisconnectCallback(this.socket.id);
    },
    
    sendLogon: function(data){
        this.send('logon', data);
    },

    sendData: function(data){
        this.send('data', data);
    },
    
    send: function(event, data){
        if (!this.isEncrypted && this.socket && this.serverRsa)
            return;
        var encrypted = this.clientRsa.encrypt(data, 'base64');
        this.socket.emit(event, encrypted);
    }

});
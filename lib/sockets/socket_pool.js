/**
 * Class SocketPool
 * 
 * Collection of sockets.
 **/
exports = module.exports = {};

var
    Class = require('classes').Class,
    moSocketBean = require('./socket_bean.js');

var LOG = null;
exports.create = function(theLOG, onLogonCallback, onDataCallback, onDisconnectCallback) {
    LOG = theLOG;
    return new SocketPool(onLogonCallback, onDataCallback, onDisconnectCallback);
};

Class('SocketPool', {
    construct: function(onLogonCallback, onDataCallback, onDisconnectCallback) {
        this.socketPool = [];
        this.onLogonCallback        = function (id, data){onLogonCallback(id, data)};
        this.onDataCallback         = function (id, data){onDataCallback(id, data)};
        this.onDisconnectCallback   = function (id, data){onDisconnectCallback(id, data)};
    },

    put: function(socket) {
        var id = socket.id + '';
        this.socketPool[id] = moSocketBean.create(LOG, id, socket, id,
            this.onLogonCallback,
            this.onDataCallback,
            this.onDisconnectCallback);
        return id;
    },

    get: function(id) {
        if (!this.socketPool[id])
            return null;
        return this.socketPool[id];
    },

    remove: function(id) {
        if (!this.get(id))
            return;
        this.socketPool[id] = null;
    },

    removeAll: function() {
        for (var i in this.socketPool) {
            var bean = this.socketPool[i];
            if (bean && bean.hasOwnProperty('socket')) {
                LOG.debug('[SocketPool::removeAll] Deleting socket bean ' + i);
                bean.socket.disconnect(true);
                delete this.socketPool[i].socket;
                delete this.socketPool[i];
            }
        }
        this.socketPool = [];
    }

});
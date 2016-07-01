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
        this.onLogonCallback        = function (id, data){onLogonCallback(id, data);};
        this.onDataCallback         = function (id, data){onDataCallback(id, data);};
        var that = this;
        this.onDisconnectCallback   = function (id){that.remove(id); onDisconnectCallback(id);};
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
        if (!id)
            return this.socketPool;
            
        if (!this.socketPool[id])
            return null;
        return this.socketPool[id];
    },

    remove: function(id) {
        if (!this.get(id))
            return;
        this.socketPool[id].socket.disconnect(true);
        this.socketPool[id].socket = null;
        delete this.socketPool[id];
    },

    removeAll: function() {
        for (var i in this.socketPool) {
            if (this.socketPool[i] && this.socketPool[i].hasOwnProperty('socket')) {
                this.socketPool[i].socket.disconnect(true);
                delete this.socketPool[i];
            }
        }
        this.socketPool = [];
    }

});
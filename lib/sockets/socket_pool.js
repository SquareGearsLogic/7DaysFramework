/**
 * Class SocketPool
 * 
 * Collection of sockets.
 **/
exports = module.exports = {};

var
    Class   = require('classes').Class,
    moClassUtils = require('../support/class_utils.js'),
    moSocketBean = require('./socket_bean.js');

exports.create = function() {
    return new SocketPool();
};

Class('SocketPool', {
    construct: function() {
        this.socketPool = [];
    },
    
    put: function(socket) {
        var id = socket.id + '';
        this.socketPool[id] = moSocketBean.create(id, socket, id);
        return id;
    },
    
    get: function(id) {
        var result = moClassUtils.getProperty(this.socketPool, id);
        if (result && result.hasOwnProperty('socket'))
            return result.socket;
        return null;
    },
    
    remove: function(id) {
        if(!this.get(id))
            return;
        this.socketPool[id] = null;
    },
    
    removeAll: function() {
        for( var i in this.socketPool){
            var bean = this.socketPool[i];
            if (bean && bean.hasOwnProperty('socket')){
                bean.socket.disconnect(true);
                delete this.socketPool[i].socket;
                delete this.socketPool[i];
            }
        }
        this.socketPool = [];
    },

});
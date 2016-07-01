/**
 * Class SocketServer
 * 
 * Listens for clients, connects back-end callbacs to sockets.
 **/
exports = module.exports = {};

var
    Class   = require('classes').Class,
    moExpress = require('express'),
    moHttp = require('http'),
    moSocketio = require('socket.io'),
    moPath = require('path'),
    moSocketPool = require('./socket_pool.js');

var LOG = null;
exports.create = function(port, theLOG, onLogonCallback, onDataCallback, onDisconnectCallback) {
    LOG = theLOG;
    return new SocketServer(port, onLogonCallback, onDataCallback, onDisconnectCallback);
};

Class('SocketServer', {
    
    construct: function(port, onLogonCallback, onDataCallback, onDisconnectCallback) {
        this.socketPool = moSocketPool.create(LOG, onLogonCallback, onDataCallback, onDisconnectCallback);
        this.router = moExpress();
        this.server = moHttp.createServer(this.router);
        this.socketio = moSocketio.listen(this.server);
        this.port = port;
        this.router.use(moExpress.static(moPath.resolve(__dirname, 'client')));
    },
    
    run: function(){
        var that = this;
        
        this.socketio.on('connection', function(socket) {
            LOG.info("[SocketServer::run] User connected " + socket.id);
            that.socketPool.put(socket);
        });
        
        this.server.listen(this.port, process.env.IP || "0.0.0.0", function() {
            var addr = that.server.address();
            LOG.info("[SocketServer::run] Server listening at", addr.address + ":" + addr.port);
        });
    },
    
    stop: function(){
        LOG.info("[SocketServer::stop] Stopping server...");
        this.socketPool.removeAll();
        this.socketPool= null;
        
        this.socketio.close();
        this.server.close();

        this.router= null;
        this.server= null;
        this.socketio= null;
        LOG.info("[SocketServer::stop] Server is down.");
    },
    
    sendLogon: function(id, data){
        var bean = this.socketPool.get(id);
        if (!bean)
            return;
        bean.sendLogon(data);
    },

    sendData: function(id, data){
        var bean = this.socketPool.get(id);
        if (!bean)
            return;
        bean.sendData(data);
    }

});
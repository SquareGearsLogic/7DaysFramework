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
exports.create = function(port, theLOG, game) {
    LOG = theLOG;
    return new SocketServer(port, game);
};

Class('SocketServer', {
    
    construct: function(port, game) {
        this.socketPool = moSocketPool.create(LOG, game);
        this.router = moExpress();
        this.server = moHttp.createServer(this.router);
        this.socketio = moSocketio.listen(this.server);
        this.port = port;
        this.router.use(moExpress.static(moPath.resolve(__dirname, 'client')));
    },
    
    run: function(){
        var that = this;
        
        this.socketio.on('connection', function(socket) {
            LOG.info("[SocketServer] User connected " + socket.id);
            that.socketPool.put(socket);
        });
        
        this.server.listen(this.port, process.env.IP || "0.0.0.0", function() {
            var addr = that.server.address();
            LOG.info("[SocketServer] Server listening at", addr.address + ":" + addr.port);
        });
    },
    
    stop: function(){
        LOG.info("[SocketServer] Stopping server...");
        this.socketPool.removeAll();
        this.socketPool= null;
        
        this.socketio.close();
        this.server.close();

        this.router= null;
        this.server= null;
        this.socketio= null;
        LOG.info("[SocketServer] Server is down.");
    }

});
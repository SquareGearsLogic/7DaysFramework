var moChai          = require("chai"),
    expect          = moChai.expect,
    assert          = moChai.assert,
    moIoClient      = require('socket.io-client'),
    moSocketServer  = require('../lib/sockets/socket_server.js');

var LOG = require('winston');

describe('Class SocketServer', function() {
    var testCondition = null;
    var server = null;
    var socket1 = null;
    var socket2 = null;

    beforeEach(function(done) {
        console.log('\n[TEST] [Before] starts...');
        testCondition = 0;
        
        server = moSocketServer.create(process.env.PORT, LOG, function(){}, function(){}, function(){});
        server.run();
        console.log('[TEST] [Before] is done.');
        done();
    });
    afterEach(function(done) {
        console.log('\n[TEST] [After] starts...');
        server.stop();
        setTimeout(function () {
            if (socket1 && socket1.connected){
                console.log('[TEST] [After] disconnecting (' + socket1.id + ') manually...');
                socket1.disconnect();
            }
            if (socket2 && socket2.connected){
                console.log('[TEST] [After] disconnecting (' + socket2.id + ') manually...');
                socket2.disconnect();
            }
            server = null;
            socket1 = null;
            socket2 = null;
            console.log('[TEST] [After] is done.');
            done();
        }, 100);
    });
    it('Server shuld start and stop', function(done) {
        // The test is to run 'before' and 'after' scripts with no issues.
        done();
    });
    
    it('Server accepts connections from multiple clients', function(done) {
        var tester = function(condition) {
            testCondition ++;
            if (testCondition == condition){
                done();
            }
        };
        var condition = 2; // we are waiting for two clients to connect.
        socket1 = moIoClient.connect('http://localhost:' + process.env.PORT, {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket1.on('connect', function() {
            console.log('[TEST] client::connect (' + socket1.id + ')');
            tester(condition);
        });
        socket1.on('disconnect', function() {
            console.log('[TEST] client::disconnected (' + socket1.id + ')');
        });
        
        socket2 = moIoClient.connect('http://localhost:' + process.env.PORT, {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket2.on('connect', function() {
            console.log('[TEST] client::connect (' + socket2.id + ')');
            tester(condition);
        });
        socket2.on('disconnect', function() {
            console.log('[TEST] client::disconnected (' + socket2.id + ')');
        });
    });
    
});
var moChai          = require("chai"),
    expect          = moChai.expect,
    assert          = moChai.assert,
    moIoClient      = require('socket.io-client'),
    moNodeRSA       = require('node-rsa'),
    moGame          = require("../lib/game/game.js");

describe('Class Game', function() {
    var game = null;
    var socket1 = null;
    var serverRsa = new moNodeRSA();
    var clientRsa = new moNodeRSA({b: 512});
    var clientPubKeyData = clientRsa.exportKey('pkcs8-public-pem');
    
    beforeEach(function(done) {
        console.log('\n[TEST] [Before]  starts...');
        game = moGame.create(process.cwd() + '/config/config.ini');
        expect(game).to.not.equal(null);
        game.run();
        setTimeout(function () {
            console.log('[TEST] [Before] is done.');
            done();
        }, 100);
    });
    afterEach(function(done) {
        console.log('\n[TEST] [After]  starts...');
        game.stop();
        game = null;
        setTimeout(function () {
            if (socket1 && socket1.connected){
                console.log('[TEST] [After] disconnecting (' + socket1.id + ') manually...');
                socket1.disconnect();
            }
            socket1 = null;
            console.log('[TEST] [After] is done.');
            done();
        }, 100);
    });
    
    it('Should be able to start up =)', function(done) {
        // The test is to run 'before' and 'after' scripts with no issues.
        done();
    }).skip;
    
    it('Should handle login process', function(done) {
        game.checkCredentials('admin', 'admin', function(isOk){
            expect(isOk).to.equal(true);
            
            game.checkCredentials('admin', '~!@#$%^&*()_+{}:"][\';<>,.?/', function(isOk){
                expect(isOk).to.equal(false);
                
                game.checkCredentials('~!@#$%^&*()_+{}:"][\';<>,.?/', '~!@#$%^&*()_+{}:"][\';<>,.?/', function(isOk){
                    expect(isOk).to.equal(false);
                    done();
                });
            });
        });
    });
    
    it('User should pass game authentication', function(done) {
        var loginStep = 0;
        socket1 = moIoClient.connect('http://localhost:' + process.env.PORT, {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket1.on('connect', function() {
            console.log('[TEST] client::connect (' + socket1.id + ')');
            socket1.emit('logon', clientPubKeyData);
        });
        socket1.on('disconnect', function() {
            console.log('[TEST] client::disconnected (' + socket1.id + ')');
        });
        socket1.on('logon', function( data ) {
            if (loginStep == 0){
                loginStep++;
                serverRsa.importKey(clientRsa.decrypt(data), 'pkcs8-public-pem');
                var encrypted = serverRsa.encrypt("admin:admin", 'base64');
                socket1.emit('logon', encrypted);
                return;
            } else if (loginStep == 1){
                loginStep++;
                data = clientRsa.decrypt(data).toString();
                console.log("[TEST] client::logon Server says [" + data + "]");
                expect(data).to.equal('welcome');
                done();
                return;
            } else if (loginStep > 1){
                console.log("[TEST] client::logon unexpected [" + data + "]");
                return;
            }
        });
        socket1.on('data', function() {
            console.log('[TEST] client::data!!!!!!!!! (' + socket1.id + ')');
        });
    });
    
});

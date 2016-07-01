var vows = require('vows'),
    assert = require('assert'),
    moIoClient = require('socket.io-client'),
    moNodeRSA = require('node-rsa'),
    moGame = require("../../lib/game/game.js");

var game = null;
var socket1 = null;
var serverRsa = new moNodeRSA();
var clientRsa = new moNodeRSA({
    b: 512
});
var clientPubKeyData = clientRsa.exportKey('pkcs8-public-pem');
var loginStep = 0;
var dataStep = 0;

vows.describe('scenario_user_requests_data').addBatch({
    'The `Game`': {
        topic: function() {
            game = moGame.create(process.cwd() + '/config/config.ini');
            this.callback();
        },
        'is running': {
            topic: function() {
                game.run();
                setTimeout(this.callback, 100);
            },
            'and client establishes connection with it.': {
                topic: function() {
                    socket1 = moIoClient.connect('http://localhost:' + process.env.PORT, {
                        'reconnection delay': 0,
                        'reopen delay': 0,
                        'force new connection': true
                    });
                    socket1.on('connect', this.callback);
                },
                '\nAfter that client establishes encrypted connection': {
                    topic: function() {
                        var that = this;
                        this.callback();
                        socket1.emit('logon', clientPubKeyData);
                    },
                    ', logs in': {
                        topic: function() {
                            var that = this;
                            socket1.on('logon', function(data) {
                                if (loginStep == 0) {
                                    loginStep++;
                                    assert.isString(data);
                                    serverRsa.importKey(clientRsa.decrypt(data), 'pkcs8-public-pem');
                                    var encrypted = serverRsa.encrypt("admin:admin", 'base64');
                                    socket1.emit('logon', encrypted);
                                }
                                else if (loginStep == 1) {
                                    loginStep++;
                                    data = clientRsa.decrypt(data).toString();
                                    assert.equal(data, 'welcome');
                                    that.callback();
                                }
                            });
                        },
                        'and asks for data personally and broadcasted.': {
                            topic: function() {
                                var encrypted = serverRsa.encrypt("I Wanna Data!", 'base64');
                                socket1.emit('data', encrypted);
                                var pool = '';
                                var that = this;
                                socket1.on('data', function(data) {
                                    data = clientRsa.decrypt(data).toString();
                                    if (dataStep == 0){
                                        dataStep++;
                                        pool += data;
                                        var encrypted = serverRsa.encrypt("[force broadcast]", 'base64');
                                        socket1.emit('data', encrypted);
                                    }else if (dataStep == 1) {
                                        pool += data;
                                        that.callback(null, pool);
                                    }
                                });
                            },
                            'Server should reply on data request.': function(data) {
                                assert.equal(data, '[Here is some data, bro!][hey, everyone!]');
                                socket1.removeAllListeners();
                                game.stop();
                                game = null;
                            }
                        }
                    }
                }
            }
        }
    }
}).export(module); // Export the Suite

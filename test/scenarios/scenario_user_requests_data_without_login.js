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

vows.describe('scenario_user_requests_data_without_login').addBatch({
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
                    ', gets server Public Key': {
                        topic: function() {
                            var that = this;
                            socket1.on('logon', function(data) {
                                assert.isString(data);
                                serverRsa.importKey(clientRsa.decrypt(data), 'pkcs8-public-pem');
                                that.callback();
                            });
                        },
                    'and asks for data without finishing Logon handshake.': {
                        topic: function() {
                            var encrypted = serverRsa.encrypt("I Wanna Data!", 'base64');
                            socket1.emit('data', encrypted);
                            var that = this;
                            socket1.on('data', function(data) {
                                data = clientRsa.decrypt(data).toString();
                                that.callback(null, data);
                            });
                        },
                        'Server should reply with "fail" for unauthorized used.': function(data) {
                            console.log('YEY!')
                            assert.equal(data, 'fail');
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

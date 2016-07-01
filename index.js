var
    moGame = require('./lib/game/game.js');

var game = moGame.create(process.cwd() + '/config/config.ini');
game.run();
/**
var
    moHttp = require('http'),
    moPath = require('path'),

    //moAsync = require('async'),
    moSocketio = require('socket.io'),
    moExpress = require('express'),

    moNodeRSA = require('node-rsa');

var
    port = process.env.PORT || 4004;

var
    router = moExpress(),
    server = moHttp.createServer(router),
    io = moSocketio.listen(server),
    serverRsa = new moNodeRSA({b: 512}),
    serverPKData = serverRsa.exportKey('pkcs8-public-pem'),
    clientRsa = new moNodeRSA();

router.use(moExpress.static(moPath.resolve(__dirname, 'client')));

var loginStep = 0;

io.on('connection', function(socket) {
    console.log("User connected");
    socket.on('disconnect', function() {
        loginStep = 0;
        console.log("User disconnected");
    });

    socket.on('login', function(msg) {
        var text = String(msg || '');

        if (!text)
            return;

        if (loginStep == 0) {
            // step 1: use client public key to send server PK
            console.log("login step 1: client PK [" + text + "]");
            console.log("login step 1: server PK [" + serverPKData + "]");
            clientRsa.importKey(text, 'pkcs8-public-pem');
            var encrypted = clientRsa.encrypt(serverPKData, 'base64');
            socket.emit('login', encrypted);
            loginStep++;
            return;
        }
        else if (loginStep == 1) {
            // step 2: check login and password.
            var username = serverRsa.decrypt(text);
            console.log("login step 2: [" + username + "] logged in.");
            var encrypted = clientRsa.encrypt("Welcome, " + username + "!", 'base64');
            socket.emit('login', encrypted);
            loginStep++;
            return;
        }
        else if (loginStep == 2) {
            console.log("user is already logged in!");
            return;
        }
    });

});

server.listen(process.env.PORT || port, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});

var hash = require('hash.js')
var res = hash.sha256().update('abc').digest('hex');
console.log(res);
**/
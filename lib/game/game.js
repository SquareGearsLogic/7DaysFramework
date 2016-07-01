/**
 * Class Game
 * 
 * Controller of the game, business layer.
 **/
exports = module.exports = {};

var
    Class           = require('classes').Class,
    moWinston       = require('winston'),
    moFs            = require('fs'),
    moPath          = require('path'),
    moHash          = require('hash.js'),
    moSysProp       = require("../../lib/support/system_properties.js"),
    moDbConnector   = require("../../lib/database/database_connector.js"),
    moSocketServer  = require('../../lib/sockets/socket_server.js'),
    moEngine        = require('../../lib/engine/engine.js'),
    moUser          = require('./user_bean.js');
    
exports.create = function(propfilePath) {
    var sysProps = moSysProp.create(propfilePath);
    if (!sysProps)
        return null;

    var LOG = null;
    var logLevel = sysProps.get('log.level');
    if (logLevel) {
        var supportedLogLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
        if (supportedLogLevels.indexOf(logLevel) == -1)
            logLevel = null;
    }
    if (!logLevel)
        logLevel = 'info';
    var logFile = sysProps.get('log.file');
    if (logFile) {
        if (!moFs.existsSync(moPath.dirname(logFile))) {
            moFs.mkdirSync(moPath.dirname(logFile));
            moFs.openSync(logFile, 'w');
        }
        LOG = new(moWinston.Logger)({
            level: logLevel,
            transports: [
                new(moWinston.transports.Console)(),
                new(moWinston.transports.File)({
                    filename: logFile
                })
            ]
        });
    } else {
        LOG = null;
        new(moWinston.Logger)({
            level: logLevel,
            transports: [
                new(moWinston.transports.Console)()
            ]
        });
    }

    var gamePort = sysProps.get('game.port');
    if (!gamePort) {
        LOG.error('[Game] please specify game.port in system properties!');
        return null;
    }

    return new Game(LOG, sysProps);
};

var SQL_GET_USER = 'SELECT t1.name AS \'user_name\', t1.password, t2.name AS \'character_name\', t2.x, t2.y, t2.z, t3.name AS \'group_name\' from c9.users t1 LEFT JOIN c9.characters t2 on t1.characters_id = t2.characters_id LEFT JOIN c9.groups t3 on t1.groups_id = t3.groups_id where t1.name like \'%{1}%\';';

Class('Game', {
    
    construct: function(LOG, sysProps){
        this.LOG = LOG;
        this.sysProps = sysProps;
        this.dbConnector = null;
        this.isRunning = false;
        this.users = [];
        var that = this;
        this.server = moSocketServer.create(sysProps.get('game.port'), LOG, 
            function (id, data){that.onLogon(id, data)},
            function (id, data){that.onData(id, data)},
            function (id, data){that.onDisconnect(id, data)}
        );
        this.engine = moEngine.create(LOG, sysProps, 
            function (data){that.server.broadcastData(data)},
            function (id, data){that.server.sendData(id, data)},
            function (id){return that.getUserInfo(id)}
        );
    },

    run: function() {
        this.LOG.info('[Game::run] Starting the game server...')
        if (this.server && this.isRunning == false) {
            this.LOG.debug('[Game] connecting to Database [' + this.sysProps.get('database.user') +
                ', ' + this.sysProps.get('database.database') +
                ', ' + this.sysProps.get('database.host') +
                ', ' + this.sysProps.get('database.port') +
                ', ' + this.sysProps.get('database.type') + ']...');
            this.dbConnector = moDbConnector.create(
                this.sysProps.get('database.user'),
                this.sysProps.get('database.password'),
                this.sysProps.get('database.database'),
                this.sysProps.get('database.host'),
                this.sysProps.get('database.port'),
                this.sysProps.get('database.type'));
            if (!this.dbConnector) {
                this.LOG.error('[Game] Can\'t setup Database!');
                return;
            }
            this.server.run();
            this.engine.run();
        }
    },

    stop: function() {
        this.server.stop();
        this.engine.stop();
        this.dbConnector.stop();
    },

    onLogon: function(id, data) {
        var credentials = data.split(':');
        var user = credentials[0];
        var password = credentials[1];
        for (var i in this.users) {
            if (this.users[i].name.toLowerCase() == user.toLowerCase()) {
                this.LOG.warn('[Game::onLogon] Login FAIL for ' + user + ' at ' + id + ' - already logged in!');
                this.server.sendLogon(id, 'fail');
                return;
            }
        }
        var that = this;
        this.checkCredentials(user, password, function(isOk, userRecord) {
            if (isOk && isOk == true) {
                that.LOG.info('[Game::onLogon] Welcome, ' + user + ' at ' + id + '!');
                that.server.sendLogon(id, 'welcome');
                that.users[id] = moUser.create(user, id, isOk, (new Date()).valueOf());
                that.users[id].x = userRecord.x;
                that.users[id].y = userRecord.y;
                that.users[id].z = userRecord.z;
            } else {
                that.LOG.warn('[Game::onLogon] Login FAIL for ' + user + ' at ' + id + '!');
                that.server.sendLogon(id, 'fail');
            }
        })
    },

    checkCredentials: function(user, password, callback) {
        var request = SQL_GET_USER.replace('{1}', user);
        var hashedPassword = moHash.sha256().update(password).digest('hex');
        if (!this.dbConnector) {
            this.LOG.err('[Game::checkCredentials] database connector is broken: ' + this.dbConnector);
            callback(false);
            return;
        }
        
        this.dbConnector.query(request, function(err, rows, fields) {
            var isOk = false;
            var userRecord = null;
            for (var i in rows) {
                var dbUserName = rows[i].user_name;
                var dbPassword = rows[i].password
                if (dbUserName.toLowerCase() == user.toLowerCase() && dbPassword == hashedPassword) {
                    isOk = true;
                    userRecord = rows[i];
                    break;
                }
            }
            callback(isOk, userRecord);
        });
    },

    onData: function(id, data) {
            if (!this.users[id] || this.users[id].isLoggedin == false) {
                this.LOG.warn('[Game::onData] unauthorized used (' + id + ') asks for data!');
                this.server.sendData(id, 'fail');
                return;
            }
            this.engine.inputStream(id, data);
        },

    onDisconnect: function(id) {
        this.LOG.info('[Game::onDisconnect] ' +
            (this.users[id] ? this.users[id].name : 'unauthorized user ') +
            '(' + id + ') ' +
            (this.users[id] ? this.users[id].loginTimestamp : 'not logged in') + '-' + (new Date()).valueOf());
        delete this.users[id];
    },
    
    getUserInfo: function(id) {
        if (!id)
            return this.users;
        return this.users[id];
    },
});
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
    if (logLevel){
        var supportedLogLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
        if (supportedLogLevels.indexOf(logLevel) == -1)
            logLevel = null;
    } 
    if (!logLevel)
        logLevel = 'info';
    var logFile = sysProps.get('log.file');
    if (logFile){
        if (!moFs.existsSync(moPath.dirname(logFile))){
            moFs.mkdirSync(moPath.dirname(logFile));
            moFs.openSync(logFile, 'w');
        }
        LOG = new (moWinston.Logger)({
            level: logLevel,
            transports: [
              new (moWinston.transports.Console)(),
              new (moWinston.transports.File)({ filename: logFile })
            ]
        });
    } else {
        LOG = null;new (moWinston.Logger)({
        level: logLevel,
        transports: [
          new (moWinston.transports.Console)()
        ]
    });
    }
    
    LOG.debug('[Game] connecting to Database ['+ sysProps.get('database.user')
        + ', ' + sysProps.get('database.database')
        + ', ' + sysProps.get('database.host')
        + ', ' + sysProps.get('database.port')
        + ', ' + sysProps.get('database.type') +']...');
    var dbConnector = moDbConnector.create(
        sysProps.get('database.user'), 
        sysProps.get('database.password'), 
        sysProps.get('database.database'), 
        sysProps.get('database.host'), 
        sysProps.get('database.port'),
        sysProps.get('database.type'));
    if (!dbConnector){
        LOG.error('[Game] Can\'t setup Database!');
        return null;
    }

    var gamePort = sysProps.get('game.port');
    if (!gamePort){
        LOG.error('[Game] please specify game.port in system properties!');
        return null;
    }
    
    return new Game(LOG, sysProps, dbConnector);
};

var SQL_GET_USER = 'select * from users where name like \'%{1}%\';';
Class('Game', {
    
    construct: function(LOG, sysProps, dbConnector){
        this.LOG = LOG;
        this.sysProps = sysProps;
        this.dbConnector = dbConnector;
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
            function (id, data){that.server.sendData(id, data)}
        );
    },
    
    run: function() {
        this.LOG.info('[Game::run] Starting the game server...')
        if (this.server && this.isRunning == false){
            this.server.run();
            this.engine.run();
        }
    },
    
    stop: function() {
        this.server.stop();
        this.server = null;
        this.dbConnector.stop();
        this.dbConnector = null;
    },
    
    logout: function(){
        
    },
    
    onLogon: function(id, data){
        var credentials = data.split(':');
        var user = credentials[0];
        var password = credentials[1];
        var that = this;
        this.checkCredentials(user, password, function(isOk){
            if (isOk && isOk == true){
                that.LOG.info('[Game::onLogon] Welcome, ' + user + ' at ' + id + '!');
                that.server.sendLogon(id, 'welcome');
                that.users[id] = moUser.create(user, id, isOk, (new Date()).valueOf());
            } else {
                that.LOG.warn('[Game::onLogon] Login FAIL for ' + user + ' at ' + id + '!');
                that.server.sendLogon(id, 'fail');
            }
        })
    },
    
    checkCredentials: function(user, password, callback){
        var request = SQL_GET_USER.replace('{1}', user);
        if (!this.dbConnector){
            this.LOG.err('[Game::checkCredentials] database connector is broken: ' + this.dbConnector);
            callback(false);
            return;
        }
        this.dbConnector.query(request, function(err, rows, fields){
            var isOk = false;
            for (var i in rows) {
                if (rows[i].name.toLowerCase() == user.toLowerCase() && rows[i].password == password){
                    isOk = true;
                    break;
                }
            }
            callback(isOk);
        });
    },
        
    onData: function(id, data){
        if (!this.users[id] || this.users[id].isLoggedin == false){
            this.LOG.warn('[Game::onData] unauthorized used (' + id + ') asks for data!');
            this.server.sendData(id, 'fail');
            return;
        }
        this.engine.inputStream(id, data);
    },
    
    onDisconnect: function(id){
        this.LOG.info('[Game::onDisconnect] ' 
            + (this.users[id] ? this.users[id].name : 'unauthorized used') 
            + '(' + id + ') ' 
            + (this.users[id] ? this.users[id].loginTimestamp : 'not logged in') + '-' + (new Date()).valueOf());
        delete this.users[id];
    },
    
});
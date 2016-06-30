/**
 * Class Game
 * 
 * Controller of the game.
 **/
exports = module.exports = {};

var
    Class           = require('classes').Class,
    moWinston       = require('winston'),
    moFs    = require('fs'),
    moPath  = require('path'),
    moSysProp       = require("../lib/support/system_properties.js"),
    moDbConnector   = require("../lib/database/database_connector.js"),
    moSocketServer  = require('../lib/sockets/socket_server.js');
    
var sysProps = null;
var dbConnector = null;

exports.create = function(propfilePath) {
    sysProps = moSysProp.create(propfilePath);
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
    dbConnector = moDbConnector.create(
        sysProps.get('database.user'), 
        sysProps.get('database.password'), 
        sysProps.get('database.database'), 
        sysProps.get('database.host'), 
        sysProps.get('database.port'),
        sysProps.get('database.type'));
    if (!dbConnector)
        return null;
    
    var gamePort = sysProps.get('game.port');
    if (!gamePort){
        LOG.error('[Game] please specify game.port in system properties!');
        return null;
    }
    
    return new Game(LOG, sysProps, dbConnector);
};

var SQL_GET_USER = 'select * from users where name=\'{1}\';';
Class('Game', {
    
    construct: function(LOG, sysProps, dbConnector){
        this.LOG = LOG;
        this.sysProps = sysProps;
        this.dbConnector = dbConnector;
        this.server = moSocketServer.create(sysProps.get('game.port'), LOG, this);
        this.isRunning = false;
    },
    
    run: function() {
        this.LOG.info('[Game::run] Starting the game server...')
        if (this.server && this.isRunning == false){
            this.server.run();
        }
    },
    
    stop: function() {
        this.server.stop();
        this.server = null;
    },
    
    logout: function(login){
        
    },
    
    login: function(user, password, callback){
        var request = SQL_GET_USER.replace('{1}', user);
        if (!dbConnector){
            callback(null);
            return;
        }
        this.dbConnector.query(request, function(err, rows, fields){
            var isOk = false;
            for (var i in rows) {
                if (rows[i].name == 'Admin' && rows[i].password == password){
                    isOk = true;
                    break;
                }
            }
            if (isOk)
                callback(true);
            else
                callback(false);
        });
    }
});
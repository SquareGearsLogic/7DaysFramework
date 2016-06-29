/**
 * Class Game
 * 
 * Controller of the game.
 **/
exports = module.exports = {};

var
    Class           = require('classes').Class,
    moSysProp       = require("../lib/support/system_properties.js"),
    moDbConnector   = require("../lib/database/database_connector.js"),
    moSocketServer  = require('../lib/sockets/socket_server.js');
    
var sysProps = null;
var dbConnector = null;

exports.run = function(propfilePath) {
    sysProps = moSysProp.create(propfilePath);
    if (!sysProps)
        return null;
    
    var LOG = require('winston');
    var logLevel = sysProps.get('log.level');
    if (logLevel){
        var supportedLogLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
        if (supportedLogLevels.indexOf(logLevel) > -1)
            LOG.level = logLevel;
    } else {
        LOG.level = 'info';
    }
    var logFile = sysProps.get('log.file');
    if (logFile)
        LOG.add(LOG.transports.File, { filename: logFile });

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

Class('Game', {
    construct: function(LOG, sysProps, dbConnector){
        this.LOG = LOG;
        this.sysProps = sysProps;
        this.dbConnector = dbConnector;
        this.server = moSocketServer.create(sysProps.get('game.port'), LOG);
    },
    
    run: function() {
        this.server.run(this.sysProps);
    },
    
    stop: function() {
        this.server.stop();
    }
});
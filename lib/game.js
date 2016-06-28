/**
 * Class Game
 * 
 * Controller of the game.
 **/
exports = module.exports = {};

var
    Class               = require('classes').Class,
    moWinston           = require('winston'),
    moSysProp           = require("../lib/support/system_properties.js"),
    moDbConnector       = require("../lib/database/database_connector.js");
    
var LOG = null;
var sysProps = null;
var dbConnector = null;

exports.run = function(propfilePath) {
    if (!moWinston) return null;
    
    sysProps = moSysProp.create(propfilePath);
    if (!sysProps)
        return null;
    
    dbConnector = moDbConnector.create(
        sysProps.get('database.user'), 
        sysProps.get('database.password'), 
        sysProps.get('database.database'), 
        sysProps.get('database.host'), 
        sysProps.get('database.port'),
        sysProps.get('database.type'));
    if (!dbConnector)
        return null;
    
    var result = new Game();
    return result;
};

Class('Game', {

    hello: function() {
        return 'hi there!';
    },

});
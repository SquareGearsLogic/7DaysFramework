/**
 * Class Game
 * 
 * Controller of the game.
 **/
exports = module.exports = {};

var
    Class = require('classes').Class;

var LOG = null;

exports.create = function(theLOG, sysProps) {
    LOG = theLOG;
    return new Engine();
};

var SQL_GET_USER = 'select * from users where name=\'{1}\';';
Class('Engine', {

    construct: function(LOG, sysProps, dbConnector, engine) {},

    run: function() {
        LOG.info('[Engine] is running.');
    },

    onData: function(data) {

    }

});
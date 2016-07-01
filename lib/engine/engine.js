/**
 * Class Engine
 * 
 * Processes clients requests and broadcasts current state.
 **/
exports = module.exports = {};

var
    Class = require('classes').Class;

var LOG = null;

exports.create = function(theLOG, sysProps, broadcastStream, informStream) {
    LOG = theLOG;
    return new Engine(broadcastStream, informStream);
};

Class('Engine', {

    construct: function(broadcastStream, informStream) {
        this.broadcastStream = function (data){broadcastStream(data)};
        this.informStream = function (id, data){informStream(id, data)};
    },

    run: function() {
        LOG.info('[Engine::run] is running.');
        //this.outputStream('spam');
    },

    inputStream: function(id, data) {
        LOG.info('[Engine::inputStream] ' + id + '[' + data + ']');
        if (data == '[force broadcast]')
            this.informStream(id, '[hey, everyone!]');
        else
            this.informStream(id, '[Here is some data, bro!]');
    }

});
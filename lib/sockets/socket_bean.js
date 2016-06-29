/**
 * Class SocketBean
 * 
 * Container of socket-related information.
 **/
exports = module.exports = {};

var
    Class   = require('classes').Class;

exports.create = function(id, socket, user) {
    return new SocketBean(id, socket, user);
};

Class('SocketBean', {
    construct: function(id, socket, user){
        this.id = id;
        this.socket = socket;
        this.user = user;
    }
});
/**
 * Class UserBean
 * 
 * Contains user information.
 **/
exports = module.exports = {};

var
    Class = require('classes').Class;

exports.create = function(name, socketId, isLoggedin, loginTimestamp) {
    return new UserBean(name, socketId, isLoggedin, loginTimestamp);
};

Class('UserBean', {

    construct: function(name, socketId, isLoggedin, loginTimestamp) {
        this.name = name;
        this.socketId = socketId;
        this.isLoggedin = isLoggedin;
        this.loginTimestamp = loginTimestamp;
    },

});
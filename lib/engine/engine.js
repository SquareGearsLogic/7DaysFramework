/**
 * Class Engine
 * 
 * Processes clients requests and broadcasts current state.
 **/
exports = module.exports = {};

var
    Class   = require('classes').Class,
    moUser  = require('../game/user_bean.js');

var LOG = null;

exports.create = function(theLOG, sysProps, broadcastStream, informStream, getUserInfo) {
    LOG = theLOG;
    return new Engine(broadcastStream, informStream, getUserInfo);
};

Class('Engine', {

    construct: function(broadcastStream, informStream, getUserInfo) {
        this.broadcastStream = function (data){broadcastStream(data)};
        this.informStream = function (id, data){informStream(id, data)};
        this.getUserInfo = function (id){return getUserInfo(id)};
        this.timer = null;
    },

    run: function() {
        this.getUserInfo()['bot1'] = moUser.create('Bot 1', 'bot1', true, (new Date()).valueOf());
        this.getUserInfo()['bot1'].y = 50;
        this.getUserInfo()['bot1'].direction = 'right';
        var that = this;
        this.timer = setInterval(function(){that.processData()}, 100);
        LOG.info('[Engine::run] is running.');
    },

    stop: function(){
        clearInterval(this.timer);
        LOG.info('[Engine::run] is stoped.');
    },

    processData: function(){
        var bot = this.getUserInfo()['bot1'];
        if (this.getUserInfo()['bot1'].direction == 'right' && this.getUserInfo()['bot1'].x < 100)
            this.getUserInfo()['bot1'].x++;
        else if (this.getUserInfo()['bot1'].direction == 'left' && this.getUserInfo()['bot1'].x > 1)
            this.getUserInfo()['bot1'].x--;
        if (this.getUserInfo()['bot1'].direction == 'right' && this.getUserInfo()['bot1'].x >= 100)
            this.getUserInfo()['bot1'].direction = 'left';
        else if (this.getUserInfo()['bot1'].direction == 'left' && this.getUserInfo()['bot1'].x <= 1)
            this.getUserInfo()['bot1'].direction = 'right';

        var usersJason = '';
        for (var i in this.getUserInfo())
            usersJason += (usersJason=='' ? '' : ',') + JSON.stringify(this.getUserInfo()[i])
        this.broadcastStream('{"broadcast":[' + usersJason + ']}');
    },

    inputStream: function(id, data) {
        if (this.getUserInfo()[id].isLoggedin == false)
            return this.informStream(id, 'fail');
        LOG.info('[Engine::inputStream] ' + id + '[' + data + ']');
        if(data == 'up')
            this.getUserInfo()[id].y -=10;
        else if(data == 'down')
            this.getUserInfo()[id].y +=10;
        else if(data == 'left')
            this.getUserInfo()[id].x -=10;
        else if(data == 'right')
            this.getUserInfo()[id].x +=10;
        else
            this.informStream(id, '{"personal":"Here is some data, bro!"}');
    }

});
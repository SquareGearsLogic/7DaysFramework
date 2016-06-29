var moChai          = require("chai"),
    expect          = moChai.expect,
    assert          = moChai.assert,
    moSocketBean    = require("../lib/sockets/socket_bean.js"),
    moSocketPool    = require("../lib/sockets/socket_pool.js");

var LOG = require('winston');

describe('Class SocketPool', function() {
    it('Should be able add and return socket object by id', function(done) {
        var pool1 = moSocketPool.create(LOG);
        var socket1 = {id: '1', disconnect: function(){}, on: function(){}};
        var id1 = pool1.put(socket1);
        
        var pool2 = moSocketPool.create(LOG);
        var socket2 = {id: '2', disconnect: function(){}, on: function(){}};
        var id2 = pool2.put(socket2);
        
        expect(pool1.get(id1)).to.equal(socket1);
        expect(pool1.get(id2)).to.equal(null);
        expect(pool2.get(id2)).to.equal(socket2);
        expect(pool2.get(id1)).to.equal(null);
        done();
    });
    it('Should return null if id is missing', function(done) {
        var pool = moSocketPool.create(LOG);
        var socket = {disconnect: function(){}, on: function(){}};
        pool.put(socket);
        expect(pool.get('unexisting_id')).to.equal(null);
        done();
    });
    it('Should be able to remove elements', function(done) {
        var pool = moSocketPool.create(LOG);
        var socket = {disconnect: function(){}, on: function(){}};
        var id = pool.put(socket);
        expect(pool.get(id)).to.equal(socket);
        pool.remove(id);
        expect(pool.get(id)).to.equal(null);
        pool.remove(id);
        expect(pool.get(id)).to.equal(null);
        done();
    });
    it('Should be able to remove All elements', function(done) {
        var pool = moSocketPool.create(LOG);
        var socket1 = {disconnect: function(){}, on: function(){}};
        var socket2 = {disconnect: function(){}, on: function(){}};
        var id1 = pool.put(socket1);
        var id2 = pool.put(socket2);
        pool.removeAll();
        expect(pool.get(id1)).to.equal(null);
        expect(pool.get(id2)).to.equal(null);
        done();
    });
    
});

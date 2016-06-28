/**
 * Class DatabaseConnector
 * 
 * Strategy class, that picks the underlying database engine based on dbtype.
 * 
 * TODO: it currently knows only MySQL.
 **/
exports = module.exports = {};

var
    Class = require('classes').Class,
    Sync = require('sync');
    
var dbModule = null;
var dbModuleConnection = null;

exports.create = function(user, password, database, host, port, dbtype) {
    if (!user || !database || !port || !dbtype)
        return null;
    
    if (dbtype.toLowerCase() == 'mysql')
        dbModule = require('mysql')
    
    if (!dbModule) 
        return null;
    
    dbModuleConnection = dbModule.createConnection({
      host     : (host ? host : 'localhost'),
      port     : port,
      user     : user,
      password : (password ? password : ''),
      database : database
    });
    
    dbModuleConnection.connect();
    return new DatabaseConnector();
};

Class('DatabaseConnector', {

    query: function(what, callback){
        dbModuleConnection.query(what, function(err, rows, fields) {
            callback(err, rows, fields);
        });
    }
    
});
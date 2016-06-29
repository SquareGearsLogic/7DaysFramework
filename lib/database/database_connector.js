/**
 * Class DatabaseConnector
 * 
 * Strategy class, that picks the underlying database engine based on dbtype.
 * 
 * TODO: it currently knows only MySQL.
 **/
exports = module.exports = {};

var
    Class = require('classes').Class;
    
exports.create = function(user, password, database, host, port, dbtype) {
    if (!user || !database || !port || !dbtype)
        return null;
    
    var dbModule = null;
    if (dbtype.toLowerCase() == 'mysql')
        dbModule = require('mysql')
    
    if (!dbModule) 
        return null;
    
    var dbModuleConnection = dbModule.createConnection({
      host     : (host ? host : 'localhost'),
      port     : port,
      user     : user,
      password : (password ? password : ''),
      database : database
    });
    
    dbModuleConnection.connect();
    return new DatabaseConnector(dbModule, dbModuleConnection);
};

Class('DatabaseConnector', {
    construct: function(dbModule, dbModuleConnection) {
        this.dbModule = dbModule;
        this.dbModuleConnection = dbModuleConnection
    },
    
    query: function(what, callback){
        try{
            this.dbModuleConnection.query(what, function(err, rows, fields) {
                callback(err, rows, fields);
            });
        } catch (err) {
            callback(err, null, null);
        }
    }
    
});
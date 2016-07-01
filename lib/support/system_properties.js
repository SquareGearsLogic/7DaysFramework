/**
 * Class SystemProperties
 * 
 * Game-friendly facade for ini file.
 **/

exports = module.exports = {};

var
    Class   = require('classes').Class,
    moFs    = require('fs'),
    moPath  = require('path'),
    moIni   = require('ini');

exports.create = function(filename) {
    if (!filename)
        return null;
    
    if (!moFs.existsSync(filename)){
        moFs.mkdirSync(moPath.dirname(filename));
        moFs.openSync(filename, 'w');
    }
    
    var config = moIni.parse(moFs.readFileSync(filename, 'utf-8'));
    if (!config.database) config.database = {};
    if (!config.database.user) config.database.user = 'root';
    if (!config.database.password) config.database.password = '';
    if (!config.database.database) config.database.database = 'game';
    if (!config.database.host) config.database.host = 'localhost';
    if (!config.database.port) config.database.port = '3306';
    if (!config.database.type) config.database.type = 'mysql';

    moFs.writeFileSync(filename, moIni.stringify(config));
    
    var result = new SystemProperties(filename, config);
    return result;
};

Class('SystemProperties', {
    construct: function(filename, config){
        this.filename = filename;
        this.config = config;
    },
    get: function (propertyName){
        if (!propertyName)
            return this.config;
        var result = this.getProperty(this.config, propertyName);
        if (!result)
            return null;
        return result;
    },
    
    save: function (){
       moFs.writeFileSync(this.filename, moIni.stringify(this.config));
    },
    
    /**
     * Searches for a given property within object
     *          obj - where to search.
     *          propertyName - a property within obj. could be comething like 
     *                          'foo.bar.baz'.
     * returns: link to the property or null if property doesn't 
     *          exist within given object.
     **/
    getProperty: function(obj, propertyName) {
        if (!propertyName)
            return null;
        
        var hasProperty = true;
        var arr = propertyName.toString().split(".");
        var prop = obj;
        for (var i in arr) {
            if (prop.hasOwnProperty(arr[i])) {
                prop = prop[arr[i]];
            }
            else {
                hasProperty = false;
                break;
            }
        }
        if (!hasProperty)
            return null;
        return prop;
    },
    
});
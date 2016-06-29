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
    moIni   = require('ini'),
    moClassUtils = require('./class_utils.js');

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
        var result = moClassUtils.getProperty(this.config, propertyName);
        if (!result)
            return null;
        return result;
    },
    
    save: function (){
       moFs.writeFileSync(this.filename, moIni.stringify(this.config));
    }
    
});
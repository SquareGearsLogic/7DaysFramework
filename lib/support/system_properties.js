/**
 * Class SystemProperties
 * 
 * Game-friendly facade for ini file.
 **/

exports = module.exports = {};

var
    Class   = require('classes').Class,
    Sync    = require('sync'),
    moFs    = require('fs'),
    moPath  = require('path'),
    moIni   = require('ini');

var thefilename = '';
var config = null;

exports.create = function(filename) {
    if (!filename)
        return null;
    thefilename = filename;
    
    if (!moFs.existsSync(filename)){
        moFs.mkdirSync(moPath.dirname(filename));
        moFs.openSync(filename, 'w');
    }
    
    config = moIni.parse(moFs.readFileSync(filename, 'utf-8'));
    if (!config.database) config.database = {};
    if (!config.database.user) config.database.user = 'root';
    if (!config.database.password) config.database.password = '';
    if (!config.database.database) config.database.database = 'game';
    if (!config.database.host) config.database.host = 'localhost';
    if (!config.database.port) config.database.port = '3306';
    if (!config.database.type) config.database.type = 'mysql';

    moFs.writeFileSync(filename, moIni.stringify(config));
    
    var result = new SystemProperties();
    return result;
};

Class('SystemProperties', {
    get: function (propertyName){
        if (!propertyName)
            return config;
        var hasProperty = true;
        var arr = propertyName.toString().split(".");
        var prop = config;
        for (var i in arr){
            if (prop.hasOwnProperty(arr[i])){
                prop = prop[arr[i]];
            }else{
                hasProperty = false;
                break;
            }
        }
        if (!hasProperty)
            return null;
        return prop;
    },
    
    save: function (){
       moFs.writeFileSync(thefilename, moIni.stringify(config));
    }
    
});
var moMocha = require("mocha"),
    moChai = require("chai"),
    expect = moChai.expect,
    assert = moChai.assert,
    moFs = require('fs'),
    moPath = require('path'),
    moIni = require('ini'),
    moFsUtils = require("../lib/support/fs_utils.js"),
    moSystemProperties = require("../lib/support/system_properties.js");

var appDir = moPath.dirname(require.main.filename);
var filepath = process.cwd() + '/tmp/config.ini';

describe('Class SystemProperties', function() {
    before('Creating temporary environment', function(done) {
        if (moFs.existsSync(process.cwd() + '/tmp'))
            moFsUtils.rmrf(process.cwd() + '/tmp')
        done();
    });
    
    it('Creates new instance at ' + filepath + ' file', function(done) {
        var sysprop = moSystemProperties.create(filepath);
        var config = moIni.parse(moFs.readFileSync(filepath, 'utf-8'));
        expect(config).to.have.a.property("database");
        expect(config.database).to.have.a.property("user");
        expect(config.database.user).to.not.equal(null);
        expect(config.database).to.have.a.property("password");
        expect(config.database.password).to.not.equal(null);
        expect(config.database).to.have.a.property("database");
        expect(config.database.database).to.not.equal(null);
        expect(config.database).to.have.a.property("host");
        expect(config.database.host).to.not.equal(null);
        expect(config.database).to.have.a.property("port");
        expect(config.database.port).to.not.equal(null);
        expect(config.database).to.have.a.property("type");
        expect(config.database.type).to.not.equal(null);
        done();
    });
    
    it('Saves new property at ' + filepath + ' file', function(done) {
        var sysprop = moSystemProperties.create(filepath);
        sysprop.get().newSection = {};
        sysprop.get().newSection.some_property = 'test';
        
        expect(sysprop.get()).to.have.a.property("newSection");
        expect(sysprop.get().newSection).to.have.a.property("some_property");
        expect(sysprop.get().newSection.some_property).to.equal('test');
        
        sysprop.save();
        var config = moIni.parse(moFs.readFileSync(filepath, 'utf-8'));
        expect(config).to.have.a.property("newSection");
        expect(config.newSection).to.have.a.property("some_property");
        expect(config.newSection.some_property).to.equal('test');
        done();
    });
    
    it('Work with unexisting property at ' + filepath + ' file', function(done) {
        var sysprop = moSystemProperties.create(filepath);
        expect(sysprop.get().database.user).to.equal('root');
        expect(sysprop.get('database.user')).to.equal('root');
        expect(sysprop.get().newSection.some_property).to.equal('test');
        expect(sysprop.get('newSection.some_property')).to.equal('test');
        expect(sysprop.get()).to.have.a.property("newSection");
        expect(sysprop.get().newSection).to.not.to.have.a.property("unexisting_property");
        expect(sysprop.get('newSection.unexisting_property')).to.equal(null);
        done();
    });
    
    after('Cleaning up temp environment...', function(done) {
        if (moFs.existsSync(process.cwd() + '/tmp'))
            moFsUtils.rmrf(process.cwd() + '/tmp')
        done();
    });
});

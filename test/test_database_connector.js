var moChai = require("chai"),
    expect = moChai.expect,
    assert = moChai.assert,
    moFs = require('fs'),
    moIni = require('ini'),
    moDbConnector = require("../lib/database/database_connector.js");
    
var config = moIni.parse(moFs.readFileSync('config/config.ini', 'utf-8'));

//moFs.writeFileSync('config/config.ini', moIni.stringify(config, { section: 'database' }));
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
            
describe('Class DatabaseConnector', function() {
    describe('General connection tests based on config/config.ini', function() {
        it('Connects to database', function(done) {
            // Add line below to each test if your Database is too slow for any reason.
            //this.timeout(5000);
            var result = moDbConnector.create(
                config.database.user, 
                config.database.password, 
                config.database.database, 
                config.database.host, 
                config.database.port, 
                config.database.type
            );
            expect(result).to.not.equal(null);
            done();
        });
        
        it('Query: read Admin record from users table', function(done) {
            var result = moDbConnector.create(
                config.database.user, 
                config.database.password, 
                config.database.database, 
                config.database.host, 
                config.database.port, 
                config.database.type
                );
            result.query('select * from users', 
                function(err, rows, fields){
                    var isAdminFound = false;
                    for (var i in rows) {
                        if (rows[i].name == 'Admin'){
                            isAdminFound = true;
                            break;
                        }
                    }
                    expect(isAdminFound).to.equal(true, 'There is no Admin record in DB');
                    done(err);
                });
                
        });
    
        it('Query: overwrite Admin\'s name to users table', function(done) {
            var result = moDbConnector.create(
                config.database.user, 
                config.database.password, 
                config.database.database, 
                config.database.host, 
                config.database.port, 
                config.database.type
                );
            result.query("update users set name='Admin' where name='Admin';", 
                function(err, rows, fields){
                    if(err)
                        return;
                    result.query('select name from users', 
                    function(err, rows, fields){
                        var isAdminFound = false;
                        for (var i in rows) {
                            if (rows[i].name == 'Admin'){
                                isAdminFound = true;
                                break;
                            }
                        }
                        expect(isAdminFound).to.equal(true, 'There is no Admin1 record in DB');
                        done(err);
                    });
            });
            
        });
        
    });
});


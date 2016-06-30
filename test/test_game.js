var moChai = require("chai"),
    expect = moChai.expect,
    assert = moChai.assert,
    moMain = require("../lib/game.js");

describe('Class Game', function() {
    var game = null;
    beforeEach(function(done) {
        console.log('\n[TEST] [Before]  starts...');
        game = moMain.create(process.cwd() + '/config/config.ini');
        expect(game).to.not.equal(null);
        game.run();
        setTimeout(function () {
            console.log('[TEST] [Before] is done.');
            done();
        }, 100);
    });
    afterEach(function(done) {
        console.log('\n[TEST] [After]  starts...');
        game.stop();
        game = null;
        console.log('[TEST] [After]  is done.');
        done();
    });
    
    it('Should be able to start up =)', function(done) {
        // The test is to run 'before' and 'after' scripts with no issues.
        done();
    });
    
    it('Should handle login process', function(done) {
        game.login('admin', 'admin', function(isOk){
            expect(isOk).to.equal(true);
            
            game.login('admin', '~!@#$%^&*()_+{}:"][\';<>,.?/', function(isOk){
                expect(isOk).to.equal(false);
                
                game.login('~!@#$%^&*()_+{}:"][\';<>,.?/', '~!@#$%^&*()_+{}:"][\';<>,.?/', function(isOk){
                    expect(isOk).to.equal(false);
                    done();
                });
            });
        });
    });
    
});

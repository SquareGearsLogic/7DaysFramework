var moChai = require("chai"),
    expect = moChai.expect,
    assert = moChai.assert,
    moMain = require("../lib/game.js");

describe('Class Game', function() {
    it('Should be able to start up =)', function(done) {
        var game = moMain.run(process.cwd() + '/config/config.ini');
        expect(game).to.not.equal(null);
        done();
    });
});

var expect = require("chai").expect;
var moMain = require("../lib/main.js");

describe("main", function(){
    describe("#getServerRsa", function(){
        it("should create server-side RSA object that has private and public key", function(){
            var args = ["--depth=4", "--hello=world"];
            var results = moMain.getServerRsa();
            
            expect(results).to.not.equal(null);
            expect(function(){results.exportKey('pkcs8-public-pem')}).to.not.throw(Error);
            expect(function(){results.exportKey('pkcs8-private-pem')}).to.not.throw(Error);
        });
   });
});

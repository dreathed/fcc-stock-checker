const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test("get a stock", function(done){
        chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG")
            .end(function (err, res) {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.isOk(JSON.parse(res.text), 'response should be valid json');
                let resObj = JSON.parse(res.text);
                assert.isDefined(resObj["stockData"], "response object should have a stockData key");
                assert.isDefined(resObj["stockData"]["price"], "response object should have a price key");
                assert.isDefined(resObj["stockData"]["likes"], "response object should have a likes key");
                done();
              });
    });

    test("view a stock and like it", function(done){
        chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG&like=true")
            .end(function(err,res){
                assert.equal(res.status, 200, 'Response status should be 200');
                let resObj = JSON.parse(res.text);
                assert.isDefined(resObj["stockData"], "response object should have a stockData key");
                assert.isDefined(resObj["stockData"]["price"], "response object should have a price key");
                assert.isDefined(resObj["stockData"]["likes"], "response object should have a likes key");
                done();
            })
    });

    test("view the same stock and like it again", function(done){
        chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG&like=true")
            .end(function(err,res){
                assert.equal(res.status, 200, 'Response status should be 200');
                let resObj = JSON.parse(res.text);
                assert.isDefined(resObj["stockData"], "response object should have a stockData key");
                assert.isDefined(resObj["stockData"]["price"], "response object should have a price key");
                assert.isDefined(resObj["stockData"]["likes"], "response object should have a likes key");
                let likes = resObj["stockData"]["likes"];
                chai
                    .request(server)
                    .keepOpen()
                    .get("/api/stock-prices?stock=GOOG&like=true")
                    .end(function(err2, res2){
                        assert.equal(res2.status, 200, 'Response status should be 200');
                        let resObj2 = JSON.parse(res.text);
                        assert.isDefined(resObj2["stockData"], "response object should have a stockData key");
                        assert.isDefined(resObj2["stockData"]["price"], "response object should have a price key");
                        assert.isDefined(resObj2["stockData"]["likes"], "response object should have a likes key");
                        assert.equal(resObj["stockData"]["likes"], resObj2["stockData"]["likes"]);
                        done();
                    })
            })
    })

    test("view two stocks", function(done){
        chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG&stock=MSFT")
            .end(function(err,res){
                assert.equal(res.status, 200, 'Response status should be 200');
                let resObj = JSON.parse(res.text);
                assert.isDefined(resObj["stockData"], "response object should have a stockData key");
                assert.isDefined(resObj["stockData"][0]["price"], "response object should have a price key");
                assert.isDefined(resObj["stockData"][0]["rel_likes"], "response object should have a likes key");
                assert.isDefined(resObj["stockData"][1]["price"], "response object should have a price key in the second entry.");
                assert.isDefined(resObj["stockData"][1]["rel_likes"], "response object should have a likes key in the second entry.");
                done();
            })
    });

    test("view two stocks and like them", function(done){
        chai
            .request(server)
            .keepOpen()
            .get("/api/stock-prices?stock=GOOG&stock=MSFT&like=true")
            .end(function(err,res){
                assert.equal(res.status, 200, 'Response status should be 200');
                let resObj = JSON.parse(res.text);
                assert.isDefined(resObj["stockData"], "response object should have a stockData key");
                assert.isDefined(resObj["stockData"][0]["price"], "response object should have a price key");
                assert.isDefined(resObj["stockData"][0]["rel_likes"], "response object should have a rel_likes key");
                assert.isDefined(resObj["stockData"][1]["price"], "response object should have a price key in the second entry.");
                assert.isDefined(resObj["stockData"][1]["rel_likes"], "response object should have a rel_likes key in the second entry.");
                assert.equal(Math.abs(resObj["stockData"][0]["rel_likes"]), Math.abs(resObj["stockData"][1]["rel_likes"]), "Absolute value of rel_likes should be the same")
                assert.isTrue(resObj["stockData"][0]["rel_likes"]<=0 || resObj["stockData"][1]["rel_likes"]<=0, "one of rel_likes should be negative")
                assert.isTrue(resObj["stockData"][0]["rel_likes"]>=0 || resObj["stockData"][1]["rel_likes"]>=0, "one of rel_likes should be positive")
                done();
            })
    });
});

'use strict';
let mongoose = require("mongoose");

let stockDataSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  likes: {
    type: Array,
    default: []
  }
})

async function getStockData(symbol){
  let response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
  let data = await response.text();
  data = JSON.parse(data)
  return data;
}

async function getStockLikes(symbol){
  let data = await StockDataModel.find({name: symbol});
  if(data.length){
    data = data[0];
    return data.likes.length;
  }else{
    return 0;
  }
}

async function likeStock(symbol, shortnedIP){
  let data = await StockDataModel.find({name: symbol});
  if(data.length){
    data = data[0];
    if(!data.likes.includes(shortnedIP)){
      data.likes.push(shortnedIP);
      data.save();
      return data.likes.length+1;
    }
  }else{
    data = new StockDataModel({name: symbol, likes: [shortnedIP]});
    data.save();
    return 1;
  }
}

let StockDataModel = mongoose.model("stock-likes", stockDataSchema);

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stock = req.query["stock"];
      console.log(req.query);
      await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      if(typeof stock == "string"){
        if(req.query["like"] !== "false"){
          let ip;
          if(req.headers['x-forwarded-for']){
            ip = req.headers['x-forwarded-for'].slice(0, req.headers['x-forwarded-for'].length-5);
          }else{
            ip = req.socket.remoteAddress.slice(0, req.socket.remoteAddress.length-5);
          }
          await likeStock(stock, ip)
        }

        let stockData = await getStockData(stock);
        let price = stockData["latestPrice"];
        let stockLikes = await getStockLikes(stock);
        res.json({stockData: {"stock": stock, "price": price, "likes": stockLikes}})
      }else if(stock instanceof Array){
        let stockData = [];
        if(req.query["like"] !== "false"){
          let ip;
          if(req.headers['x-forwarded-for']){
            ip = req.headers['x-forwarded-for'].slice(0, req.headers['x-forwarded-for'].length-5);
          }else{
            ip = req.socket.remoteAddress.slice(0, req.socket.remoteAddress.length-5);
          }
          for(let symbol of stock){
            await likeStock(symbol, ip)
          }
        }
        
        for(let symbol of stock){
          let data = await getStockData(symbol);
          let stockLikes = await getStockLikes(symbol);
          stockData.push({"stock": symbol, "price": data["latestPrice"], "rel_likes": stockLikes});
        }
        console.log(stockData);
        let rel_likes1 = stockData[0]["rel_likes"] - stockData[1]["rel_likes"];
        let rel_likes2 = stockData[1]["rel_likes"] - stockData[0]["rel_likes"];

        stockData[0]["rel_likes"] = rel_likes1
        stockData[1]["rel_likes"] = rel_likes2
        console.log(stockData)
        res.json({"stockData": stockData});
      }
      mongoose.disconnect();
    });
};

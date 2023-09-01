const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');
require('dotenv').config();
const app = express();
const errorMiddleWare = require('./middleWare/error')


app.use(express.json({
    limit: '50mb'
}));
app.use(cookieParser());

//Route imports
const product = require('./routes/productRoute');
const user = require('./routes/userRoutes')
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");


app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use("/api/v1",payment);


app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});
  



// middleware for error
app.use(errorMiddleWare);

module.exports = app;
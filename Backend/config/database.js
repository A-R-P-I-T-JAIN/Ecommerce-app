// require('dotenv').config();
const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(
      "mongodb+srv://meArpitJain:passwordForArpit@ecommerce.r5rm0e1.mongodb.net/test?retryWrites=true&w=majority",
      // "mongodb://0.0.0.0:27017/",
      { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
      }
    )
    .then((data) => {
      console.log(`mongodb connected with server: ${data.connection.host}`);
    })
    .catch((er) => {
      console.log(er);
    });
};

module.exports = connectDatabase;

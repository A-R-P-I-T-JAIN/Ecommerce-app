const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter product name"]
    },
    description:{
        type:String,
        required:[true,"please enter product description"]
    },
    price:{
        type:Number,
        required:true,
        maxLength:[8,"price can not exceed 8 characters"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"please enter product category"]
    },
    stock:{
        type:Number,
        required:[true,"please enter product stock"],
        default:1,
        maxLength:[4,"stock can not exceed 4 characters"]
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Product",productSchema);
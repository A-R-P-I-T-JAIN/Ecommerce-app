const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter your name"],
        maxLength:[40,"name can not exceed 40 characters"],
        minLenth:[4,"name should be greater than 4 characters"]
    },
    email:{
        type:String,
        unique:[true,"email already registered"],
        required:[true,"please enter your email"],
        validate:[validator.isEmail,"please enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"please enter your password"],
        select:false,
        minLength:[8,"password should be greater than 8 characters"]
    },
    avatar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
});

// password hashing
userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        next();
    }

    this.password = await bcryptjs.hash(this.password,10);
})

// JWT token
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id},process.env.SECRET_KEY,{
        expiresIn: "5d"
    })
}   

// compare password

userSchema.methods.comparePassword = async function (password) {
    let a = await bcryptjs.compare(password, this.password);
    // console.log(a);
    return a;
  };

// reset password token

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15*60*1000;

    return resetToken;
}


module.exports = mongoose.model("User",userSchema);
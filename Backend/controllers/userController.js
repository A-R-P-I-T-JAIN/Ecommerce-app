const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleWare/catchAsyncErrors');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const { TokenExpiredError } = require('jsonwebtoken');
const sendemail = require('../utils/sendEmail.js');
const crypto = require('crypto')
const cloudinary = require('cloudinary')

// Register a user

exports.registerUser = catchAsyncErrors(async(req,res,next) => {
    
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
    
    const{name,email,password} = req.body;

        const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    })

    sendToken(user,201,res);
})

// login user

exports.loginUser = catchAsyncErrors(async (req,res,next) => {
    const {email,password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password",400));
    }

    const user = await User.findOne({ email }).select("+password");
    

    if(!user){
        return next(new ErrorHandler("invalid email or password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    

    if(!isPasswordMatched){
        return next(new ErrorHandler("invalid email or password",401));
    }

    sendToken(user,201,res);
})

// logout user

exports.logoutUser = catchAsyncErrors(async (req,res,next) => {
    res.cookie("token",null, {
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
})
// forgot password

exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHandler("user not found",404));
    }

        // get reset password token
    
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    const message = `your password reset token is:- \n\n ${resetPasswordUrl} \n\n if you have not requested this url, then please ignore it!`

    try {
        await sendemail({
            email: user.email,
            subject: `Ecommerce Reset Password`,
            message
        })

        res.status(200).json({
            success:true,
            message: `email sent to ${user.email} successfully`
        })
        
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message,500));
    }
})

// reset password

exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{
    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt:Date.now() }
    })

    if(!user){
        return next(new ErrorHandler("reset password token is invalid or has been expired",400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);
})

// get user detail

exports.getUserDetail = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    })
})


// update profile detail

exports.updateProfile = catchAsyncErrors(async (req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }

    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);
    
        const imageId = user.avatar.public_id;
    
        await cloudinary.v2.uploader.destroy(imageId);
    
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
    
        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })


    res.status(200).json({
        success:true,
        user
    })

})

// get all user -- admin

exports.getAllUser = catchAsyncErrors(async (req,res,next)=>{
    const users = await User.find();
    const userCount = await User.countDocuments();

    res.status(200).json({
        success:true,
        userCount,
        users
    })
})


// get  user detail -- admin

exports.getSingleUser = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("User does not exist",400));
    }

    res.status(200).json({
        success:true,
        user
    })
})

// update user role --admin

exports.updateUserRole = catchAsyncErrors(async (req,res,next)=>{

    const newUserData = {
        role:req.body.role
    }

    // we will add avatar in cloudinary later

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })


    res.status(200).json({
        success:true
    })

})

// delete user --admin

exports.deleteUser = catchAsyncErrors(async (req,res,next)=>{


    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("user not found",404));
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.deleteOne();

    res.status(200).json({
        success:true,
        message:"user deleted successfully"
    })

})
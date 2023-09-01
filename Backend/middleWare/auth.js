const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleWare/catchAsyncErrors');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.isAuthenticatedUser = catchAsyncErrors(async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("please login to access this resourrce",401));
    }

    const decodedData = jwt.verify(token,process.env.SECRET_KEY);

    req.user = await User.findById(decodedData.id);

    next();
})

exports.authorizeRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource`,403));
        }

        next();
    }
}
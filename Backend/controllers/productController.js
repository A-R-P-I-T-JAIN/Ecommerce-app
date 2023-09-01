const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleWare/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');
const cloudinary = require("cloudinary");


// create product -- Admin
exports.createProduct = catchAsyncErrors(async (req,res,next) => {

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;


    const product = await Product.create(req.body);


    
    res.status(201).json({
        success:true,
        product
    })
})
// get all products
exports.getAllProducts = catchAsyncErrors(async(req,res) => {
    const resultPerPage = 9;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(),req.query).search().filter()
    .pagination(resultPerPage);
    const products = await apiFeature.query
   
    
    res.status(200).json({
        productCount,
        products
    })
})

// get all products(admin)

exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find();
  
    res.status(200).json({
      success: true,
      products,   
    });
  });

// update product -- Admin
exports.updateProduct = catchAsyncErrors(async(req,res,next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
        product
    })
})
// Delete product -- Admin
exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }

    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();

    res.status(200).json({
        success:true,
        message:"product deleted successfully"
    })
})
// get product detail
exports.getProductDetail = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        product
    })
})

// Create new review or update the review

exports.createProductReview = catchAsyncErrors(async (req,res,next) => {
    const{rating,comment,productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    if(!product){
        return next(new ErrorHandler("Product not found",400))
    }

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if(isReviewed){
        product.reviews.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString()){
                rev.rating = rating,
                rev.comment = comment
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating
    })

    product.ratings = avg / product.reviews.length;

        await product.save({validateBeforeSave:false});

        res.status(200).json({
            success:true
        })
})

// get all reviews 

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  });

//  delete reviews

exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });
const express = require('express');
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetail, createProductReview, getProductReviews, deleteReview, getAdminProducts } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleWare/auth');
const router = express.Router();

router.route("/products").get(getAllProducts);

router.route("/product/new").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);

router.route("/admin/products").get(isAuthenticatedUser,authorizeRoles("admin"),getAdminProducts);

router.route("/admin/product/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct);

router.route("/product/:id").get(getProductDetail);

router.route("/review").put(isAuthenticatedUser,createProductReview);

router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReview);

module.exports = router;
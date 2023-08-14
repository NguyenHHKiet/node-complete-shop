const Product = require("../models/productModel");

exports.getCart = (req, res) => {
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            const products = user.cart.items;
            res.status(200).json(products);
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;

    Product.findById(prodId)
        .then((product) => {
            return req.user.addToCart(product);
        })
        .then((result) => {
            console.log("Add to Cart Success!!");
            res.status(200).json("Add to Cart Success!!");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.productId;

    req.user
        .removeFromCart(prodId)
        .then(() => {
            res.status(200).json("Delete item cart successfully");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

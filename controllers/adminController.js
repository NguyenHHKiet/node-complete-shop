const Product = require("../models/productModel");

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        // .populate("userId", "name")
        // .select("title price -_id")
        .then((products) => {
            res.status(200).json(products);
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then((product) => {
            res.status(200).json(product);
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

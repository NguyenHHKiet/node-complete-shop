const { validationResult } = require("express-validator");
const Product = require("../models/productModel");
const fileHelper = require("../utils/file");

exports.getProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.status(200).json(products);
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProduct = (req, res, next) => {
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

exports.postProducts = (req, res, next) => {
    // const image = req.file;

    // if (image) {
    //     return res.status(422).json({
    //         errorMessage: "Attached file is not an image.",
    //         validationErrors: [],
    //     });
    // }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    // const imageUrl = image.path;

    const product = new Product({
        ...req.body,
        // imageUrl,
        userId: req.user,
    });
    product
        .save()
        .then(() => {
            res.status(200).json("Created successfully");
            console.log("Created successfully");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const { productId, title, imageUrl, price, description } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render({
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    // const product = new Product({
    //     id: new ObjectId(productId),
    //     title,
    //     price,
    //     imageUrl,
    //     description,
    // });
    Product.findById(productId)
        .then((product) => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res
                    .status(400)
                    .json({ message: "Error userId in session." });
            }
            product.title = title;
            product.price = price;
            product.description = description;
            if (imageUrl.trim() !== "") {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = imageUrl;
            }
            return product
                .save()
                .then(() => {
                    res.status(200).json("Updated Product Successfully!!");
                })
                .catch((err) => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.deleteProduct = async (req, res) => {
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return next(new Error("Product not found."));
            }
            // fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id });
        })
        .then(() => {
            console.log("DESTROYED PRODUCT");
            res.status(200).json({ message: "Success!" });
        })
        .catch((err) => {
            res.status(500).json({ message: "Deleting product failed." });
        });
};

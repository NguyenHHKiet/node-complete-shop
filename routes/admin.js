const express = require("express");

const isAuth = require("../middleware/is-auth");
const { body, check } = require("express-validator");

const productsController = require("../controllers/productController");
const adminController = require("../controllers/adminController");
// const uploader = require("../middleware/upload");

const router = express.Router();

router.get("/products", adminController.getProducts);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post(
    "/add-product",
    [
        body("title", "Please enter at least 3 characters.")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        // express-validator middleware
        // check("image", "No file uploaded").exists(),
        body("price", "Please enter a valid price.").isFloat(),
        body("description", "Please enter at least 5 characters.")
            .isLength({ min: 5, max: 400 })
            .trim(),
    ],
    isAuth,
    // uploader,
    productsController.postProducts
);

router.post(
    "/edit-product",
    [
        body("title")
            .isString()
            .isLength({ min: 3 })
            .trim()
            .withMessage("Please enter at least 3 characters."),
        body("price").isFloat().withMessage("Please enter a valid price."),
        body("description")
            .isLength({ min: 5, max: 400 })
            .trim()
            .withMessage("Please enter at least 5 characters."),
    ],
    productsController.postEditProduct
);

router.delete("/product/:productId", isAuth, productsController.deleteProduct);

module.exports = router;

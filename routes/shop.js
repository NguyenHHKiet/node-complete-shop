const express = require("express");

const isAuth = require("../middleware/is-auth");

const productsController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const ordersController = require("../controllers/orderController");

const router = express.Router();

router.get("/", productsController.getProducts);

router.get("/products", productsController.getProducts);

router.get("/products/:productId", productsController.getProduct);

router.get("/cart", cartController.getCart);

router.post("/cart", cartController.postCart);

router.post("/cart-delete-item", cartController.postCartDeleteProduct);

router.post("/create-order", ordersController.postOrder);

router.get("/orders", ordersController.getOrders);

router.get("/orders/:orderId", ordersController.getInvoice);

module.exports = router;

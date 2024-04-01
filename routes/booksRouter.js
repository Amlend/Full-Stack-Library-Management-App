const express = require("express");
const OrderController = require("../controllers/putOrder");
const router = express.Router();

router.get("/", OrderController.getOrderPage);
router.post("/register", OrderController.postOrderData);
router.post("/returned", OrderController.postReturnData);
router.get("/orders", OrderController.getOrders);
router.get("/returnedOrders", OrderController.getReturnedOrders);
router.delete("/orders/:id", OrderController.deleteOrder);

module.exports = router;

const express = require("express")
const router = express.Router();

const {
    addtoCart,
    getCartItems,
    deleteItemFromCart
} = require("../controller/Cart");

const { auth, isStudent } = require("../middlewares/AuthNMid");

router.post("/addtoCart", auth, isStudent, addtoCart);
router.get("/getCartItems", auth, getCartItems);
router.delete("/deleteItemFromCart", auth, isStudent, deleteItemFromCart);

module.exports = router
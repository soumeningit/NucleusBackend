const Cart = require("../models/Cart");
const User = require("../models/User");

exports.addtoCart = async (req, res) => {
    try {
        console.log("Inside add to cart inside server.");
        const userId = req.user.id;
        const { courseIds } = req.body; // Expecting an array of courseIds
        console.log("Course ids are " + courseIds + " user id is : ", userId);

        if (!Array.isArray(courseIds)) {
            return res.status(400).json({ message: 'courseIds should be an array.' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, courses: [] });
        }

        // Add each courseId to the cart if not already present
        for (const courseId of courseIds) {
            if (!cart.courses.includes(courseId)) {
                cart.courses.push(courseId);
            }
        }

        console.log("Cart is : ", cart);
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Courses added to cart successfully.",
            cart
        });

    } catch (error) {
        console.log("Item can't be added to cart right now");
        console.log("Error is : ", error);
        res.status(500).json({
            message: "Error adding courses to cart.",
            error: error.message
        });
    }
}

exports.getCartItems = async function (req, res) {
    try {

        const userId = req.user.id;
        console.log("User id is : ", userId);
        const cart = await Cart.findOne({ userId }).populate("courses");
        console.log("Cart is : ", cart);
        return res.status(200)
            .json({
                success: true,
                message: "Cart items fetched successfully.",
                cart
            });
    } catch (error) {
        console.log("Error getting cart items : ", error);
        console.log(error);
        res.status(500).json({
            message: "Error adding courses to cart.",
            error: error.message
        });
    }
}

exports.deleteItemFromCart = async function (req, res) {
    try {
        console.log("INSIDE DELETE FROM CART IN SERVER....")
        const userId = req.user.id;
        const { courseId } = req.body;
        console.log("Course id is : ", courseId);
        console.log("User id is : ", userId);
        let cart = await Cart.findOne({ userId });
        if (cart) {
            cart.courses = cart.courses.filter(id => id.toString() !== courseId.toString());
            await cart.save();
        }

        const updatedCart = await Cart.findOne({ userId }).populate("courses");
        console.log("Updated cart is : ", updatedCart);

        return res.status(200)
            .json({
                success: true,
                message: "Course removed from cart successfully.",
                updatedCart
            });

    } catch (error) {
        console.log("Error deleting item from cart : ", error);
    }
}






















// exports.addtoCart = async (req, res) => {
//     try {

//         console.log("inside add to cart in server.")

//         const { items } = req.body; // Extract items array from request body
//         console.log("items inside item add to cart inside server : ", items)

//         let courseId = items.map(course => course.courseId);
//         console.log("courseId inside item add to cart inside server : ", courseId)

//         const userId = req.user.id;
//         console.log("userId inside item add to cart inside server : ", userId)

//         let cart = await Cart.findOne({ userId });
//         if (cart) {
//             // Update existing cart
//             const itemIndex = cart.items.findIndex(item => item.courseId.toString() === courseId);
//             if (itemIndex > -1) {
//                 cart.items[itemIndex].quantity += 1;
//             } else {
//                 cart.items.push({ courseId });
//             }
//         } else {
//             // Create new cart
//             cart = new Cart({ userId, items });
//         }
//         await cart.save();

//         // let updatedCart = await Cart.findOne({ userId }).populate('items.courseId');
//         let updatedCart = await Cart.findOne({ userId }).populate({
//             path: 'items.courseId',
//             model: 'Course',
//             select: 'courseName courseDescription thumbnail price' // Specify the fields you want to populate
//         });

//         console.log("updatedCart inside item add to cart inside server : ", updatedCart)

//         res.status(200).json({
//             success: true,
//             message: "Item added to cart successfully",
//             cart
//         });

//     } catch (e) {
//         console.log("Item can't be Add to cart right now, try after some time");
//         console.log(e);
//         return res.status(400)
//             .json({
//                 success: false,
//                 message: "Add to cart failed",
//             })
//     }
// }

// exports.getCartItems = async (req, res) => {
//     try {
//         const { userId } = req.user.id;
//         const cart = await Cart.findOne({ userId });
//         res.json(cart);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// exports.deleteItemFromCart = async (req, res) => {
//     try {
//         await Cart.findOneAndDelete({ userId: req.params.userId });
//         res.json({ message: 'Cart cleared' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }
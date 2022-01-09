const express = require('express');
const mongoose = require('mongoose');

const Cart = require('./../model/cart-model');
const { Knuth_Book, Taleb_Book } = require('./../data/products');

const authorize = require('./../auth/authorize');

const router = express.Router();

router.post('/', async (req, res, next) => {
    const { user_id, product_id, quantity } = req.body;
    // console.log(req.body);

    let price = 0;
    let totalPrice = 0;
    let thumbnail = '';
    let title = '';
    let author = '';

    try {
        let product = await Knuth_Book.find({ _id: product_id });
        if (product.length === 0) {
            product = await Taleb_Book.find({ _id: product_id });
        }
        price = product[0].price;
        totalPrice = product[0].price * quantity;
        thumbnail = product[0].thumbnail;
        author = product[0].author;
        title = product[0].title;
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occurred'
            }
        })

    }

    try {
        const cart = await Cart.find({ user_id: user_id });
        if (cart.length === 0) {
            const cartItem = new Cart({
                user_id: user_id,
                price: totalPrice
            })

            cartItem.items.push({
                product_id: product_id,
                quantity: quantity,
                price: price,
                totalPrice: totalPrice,
                thumbnail,
                author,
                title
            });

            await cartItem.save();
        } else {
            let isOldItem = false;
            for (let i = 0; i < cart[0].items.length; i++) {
                if (cart[0].items[i].product_id === product_id) {
                    cart[0].items[i].quantity = quantity;
                    cart[0].items[i].price = price;
                    cart[0].items[i].totalPrice = totalPrice;
                    isOldItem = true;
                }
            }
            if (!isOldItem) {
                cart[0].items.push({
                    product_id: product_id,
                    quantity: quantity,
                    price: price,
                    totalPrice: totalPrice,
                    thumbnail,
                    author,
                    title
                });
                cart[0].price = totalPrice;
            }
            cart[0].price = totalPrice;
            const newCart = new Cart(...cart);
            await newCart.save();
        }
    } catch (err) {
        // console.log(err);
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occurred'
            }
        })
    }

    let totalQuantity = 0;
    try {
        let totalPrice = 0;
        const allItems = await Cart.find({ user_id: user_id });
        allItems[0].items.forEach(data => {
            totalQuantity += data.quantity;
            totalPrice += data.totalPrice;
        })
        allItems[0].price = totalPrice;
        const cart = new Cart(...allItems);
        await cart.save();
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occurred'
            }
        })
    }
    return res.status(201).json({
        status: 'success',
        data: {
            message: "Items Added to cart",
            totalQuantity: totalQuantity
        }
    })
});


router.put('/:orderId', async (req, res, next) => {
    const order_id = req.params.orderId;
    const { product_id, quantity } = req.body;

    let price = 0;
    let totalPrice = 0;
    try {
        let product = await Knuth_Book.find({ _id: product_id });
        if (product.length === 0) {
            product = await Taleb_Book.find({ _id: product_id });
        }
        price = product[0].price;
        totalPrice = product[0].price * quantity;
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occurred'
            }
        })
    }

    try {
        const cart = await Cart.find({ _id: order_id });
        cart[0].items.forEach(item => {
            if (item.product_id === product_id) {
                item.quantity = quantity;
                item.price = price;
                item.totalPrice = totalPrice;
            }
        });
        const updatedCart = new Cart(...cart);
        await updatedCart.save();
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occurred'
            }
        })
    }

    let totalQuantity = 0;
    try {
        let totalPrice = 0;
        const allItems = await Cart.find({ _id: order_id });
        allItems[0].items.forEach(data => {
            totalQuantity += data.quantity;
            totalPrice += data.totalPrice;
        });
        allItems[0].price = totalPrice;
        const cart = new Cart(...allItems);
        await cart.save();
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occurred'
            }
        })

    }
    return res.status(201).json({
        status: 'success',
        data: {
            message: "Items updated in cart",
            totalQuantity: totalQuantity
        }
    })
})

router.delete('/:itemId/:userId', async (req, res, next) => {
    const user_id = req.params.userId;
    const { itemId } = req.params;

    // console.log(req.body);
    console.log(user_id, itemId);

    try {
        const cart = await Cart.find({ user_id: user_id });
        const newItems = cart[0].items.filter(item => {
            console.log(item.id === itemId);
            return item.id !== itemId;
        })

        cart[0].items = newItems;
        if (newItem.length === 0)
            cart[0].price = 0;
        else {
            cart[0].price = newItems.reduce((prevItem, currItem) => {
                return prevItem.totalPrice + currItem.totalPrice;
            })
        }

        const updatedCart = new Cart(...cart);
        await updatedCart.save();

    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occured'
            }
        })
    }

    return res.status(204).json({});
})


router.get('/:userId', authorize, async (req, res, next) => {
    const user_id = req.params.userId;
    try {
        const cart = await Cart.find({ user_id: user_id });

        return res.status(200).json({
            status: 'success',
            data: {
                cart: cart
            }
        })
    } catch (err) {
        // console.log(err)
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occured'
            }
        })
    }
})

module.exports = router;
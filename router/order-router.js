const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require("crypto");
const dotenv = require('dotenv');

const Cart = require("./../model/cart-model");
const Order = require("./../model/order-model");

const authorize = require('./../auth/authorize');

dotenv.config();

const router = express.Router();
const rzpKey = process.env.RZP_KEY_ID;
const secret = process.env.RZP_KEY_SECRET;
const currency = 'INR';

const rzpInstance = new Razorpay({
    key_id: rzpKey,
    key_secret: secret,
});

router.get('/:user_id', authorize, (req, res) => {
    Order.find({ user_id: req.params.user_id, status: 'COMPLETED' })
        .then((order) => {

            res.status(200).json({
                status: 'success',
                data: [
                    order
                ]
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

router.post('/', authorize, async (req, res) => {
    const userID = req.body.user_id;
    const user_id = mongoose.Types.ObjectId(userID);


    try {
        const cart = await Cart.findOne({ user_id: user_id });
        const { items, price } = cart;
        const priceInPaise = (Math.round(price * 100) / 100).toFixed(2);
        const amount = Number.parseInt(priceInPaise * 100);

        const order = await new Order({ user_id: user_id, amount, currency, status: 'CREATED', items });
        await order.save();

        const orderId = order.id;

        const options = {
            amount,
            currency,
            //receipt denotes our order id on Razorpay
            receipt: orderId,
        };

        //Create order on razorpay
        rzpInstance.orders.create(options, (err, rzpOrder) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    status: 'fail',
                    data: {
                        message: 'Error in creating razorpay order'
                    }
                });
            }

            res.status(201).json({
                amount,
                currency,
                orderId,
                //This is required by client to co-ordinate with razorpay
                rzpOrderId: rzpOrder.id
            });
        });
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            data: {
                message: 'Please signup before placing any Order'
            }
        })
    }
});

router.put('/:id', authorize, async (req, res) => {
    const orderId = req.params.id;
    const { user_id } = req.body;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body.rzp_data;

    if (!razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
            status: 'fail',
            data: {
                message: 'Missing razorpay payment id or signature'
            }
        });
    }

    const generated_signature = crypto.createHmac('sha256', secret).update(orderId + "|" + razorpay_payment_id).digest('hex');

    if (generated_signature === razorpay_signature) {
        await Order.update({ id: orderId }, { $set: { status: 'COMPLETED', razorpay_payment_id, razorpay_order_id, razorpay_signature } }).then(() => {
            console.log('order completed');
            return res.status(204).json({
                status: 'success',
                data: {
                    message: 'Order successfully placed'
                }
            });
        });

        console.log("cart items");
        await Cart.deleteOne({ user_id: user_id });
    } else {
        console.log("errr");
        return res.status(400).json({
            status: 'fail',
            data: {
                messge: 'Signature validation failed'
            }
        })

    }
});

module.exports = router;
const mongoose = require('mongoose');

//Update some field from RAZORPAY
const orderSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    items: [],
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },

})

module.exports = mongoose.model('Order', orderSchema);
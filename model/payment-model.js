const mongoose = require('mongoose');

//Update some field from RAZORPAY
const paymentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    }
})

module.exports = mongoose.Schema('Payment', paymentSchema);
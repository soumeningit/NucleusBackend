const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    currency: {
        type: String,
        trim: true,
    },
    amount: {
        type: Number,
        required: true
    },
    razorpayStatus: {
        type: String,
        trim: true,
    },
    razorpayOrderId: {
        type: String,
        trim: true,
    },
    cardDetails: {
        type: Object,
    },
}, { timestamps: true });

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
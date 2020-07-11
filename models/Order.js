const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    address: {
        district:{
            type: String,
            required: true
        },
        details: {
            type: String,
            required: true
        }
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status : {
        type: String,
        required: true,
        default: 'pending'// other options: completed, cancelled
    },
    orderId: {
        type: Number,
        required: true
    },
    productList: [
        {
            productId: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            imageUrl: {
                type: String,
                required: false
            },
            weight: {
                type: String,
                required: false
            },
            quantity: {
                type: Number,
                required: true
            },
            unitPrice: {
                type: Number,
                required: true
            },
            subTotal:{
                type: Number,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }  
});

module.exports = mongoose.model('Order', OrderSchema);
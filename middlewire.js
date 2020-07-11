const Cart = require('./models/Cart');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const Order = require('./models/Order');

const createCartEntry = (req, res, next) => {
    const body = req.body;

    const cartEntry = new Cart({
        userId: req.user.user_id,
        totalPrice: body.totalPrice,
        productList: body.productList
    });

    req.cart = cartEntry;
    next();
};

const createOrder = (req, res, next) => {
    if( typeof createOrder.orderId === 'undefined' ) {
        createOrder.orderId = 10000;
    }
    createOrder.orderId++;

    const body = req.body;
    const order = new Order({
        userId: req.user.user_id,
        phoneNumber: body.phoneNumber,
        address: body.address,
        totalPrice: body.totalPrice,
        orderId: createOrder.orderId,
        productList: body.productList
    });

    req.order = order
    next();
}

const log = (req, res, next) => {
    const logObject = {
        path: req.originalUrl,
        method: req.method
    };
    
    if(req.method === 'POST') {
        logObject.body = req.body;
    }
    console.dir(logObject);
    next();
}

module.exports.createCartEntry = createCartEntry;
module.exports.createOrder = createOrder;
module.exports.log = log;
const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const Order = require('../models/Order');

const { createOrder } = require('../middlewire');
const { pageAndLimitValidation, inputValidationForGetOrder, mongoDbIdValidation } = require('../validation');
const { verifyToken, verifyAdmin } = require('../verification');

// admin can get all orders by setting all=true
// admin and user can get orders by userId or orderId or phoneNumber
router.get('/', verifyToken,  pageAndLimitValidation, inputValidationForGetOrder, async (req, res, next) => {
    const page = req.page;
    const limit = req.limit;
    const all = !!req.query.all;
    
    try {
        let orders = [];
        if(req.user.isAdmin === false && all === true) {
            next(createError(403, 'Access Denied! You are not authorized to do this operation!'));
            return;
        } else if(req.user.isAdmin === true && all === true) {
            orders = await Order.find(
                {},
                null,
                {
                    sort: { createdAt: -1 },
                    skip: (page - 1) * limit,
                    limit: limit
                }
            );
        } else {
            orders = await Order.find(
                {
                    $or: [
                        { userId: req.query.userId },
                        { orderId: req.query.orderId },
                        { phoneNumber: req.query.phoneNumber }
                    ]
                },
                null,
                {
                    sort: { createdAt: -1 },
                    skip: (page - 1) * limit,
                    limit: limit
                }
            );
        }
        res.status(200).send(orders);
    } catch(error) {
        next(error);
    }
});

// admin, user
// create order
router.post('/', verifyToken, createOrder, async (req, res, next) => {
    const order = req.order;

    try {
        const savedOrder = await order.save();
        if(!!savedOrder) {
            res.status(201).send(savedOrder);
        } else {
            next(createError(500, 'order could not be saved'));
        }
    } catch(error) {
        next(error);
    }
});


// update 
// admin can update all orders but user can update his own order
router.put('/:id', verifyToken, mongoDbIdValidation, async (req, res, next) => {
    const body = req.body;

    try {
        const order = await Order.findById(req.params.id);
        if(!order) {
            return next(createError(404, 'order not found. so can not be updated'));
        } 
        //permission check
        if(req.user.isAdmin === false) {
            if(req.user.user_id !== order.userId) {
                next(createError(403, 'Access Denied! You are not authorized to do this operation!'));
                return;
            } else if(order.status !== 'pending') {
                next(createError(403, 'Access Denied! You are not authorized to do this operation!'));
                return;
            } else {
                // only allowed to update address, status and phone number for user
                const allowedField = ['address', 'status', 'phoneNumber'];
                for(const property in body) {
                    if(allowedField.includes(property) === false) {
                        next(createError(403, 'Access Denied! You are not authorized to do this operation!'));
                        return;
                    }
                }
            }

        }

        order.updatedAt = Date.now();
        for(const property in body) {
            if(allowedField.includes(property)) {
                order[property] = body[property];
            }
        }

        const updatedOrder = await order.save();
        if(!!updatedOrder) {
            res.status(200).send(updatedOrder);
        } else {
            next(createError(500, 'order can not be updated!'));
        }
    } catch(error) {
        next(error);
    }
})

//only admin can delete
router.delete('/', verifyAdmin, async (req, res, next)=> {
    const body = req.body;
    try {
        const deletedOrders = await Order.deleteMany(
            {
                '_id': { $in: body.idList }
            }
        );
        res.status(200).send(deletedOrders);
    } catch(error) {
        next(error);
    }
});

router.delete('/:id', verifyAdmin, mongoDbIdValidation, async (req, res, next)=> {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);

        if(!!deletedOrder) {
            res.status(200).send(deletedOrder);
        } else {
            next(createError(404, `order ${req.params.id} not found!`));
        }
    } catch(error) {
        next(error);
    }
});

module.exports = router;
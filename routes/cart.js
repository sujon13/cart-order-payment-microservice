const express = require('express');
const router = express.Router();
const createError = require('http-errors');

const { createCartEntry } = require('../middlewire');
const { verifyToken } = require('../verification');
const Cart = require('../models/Cart');
const { mongoDbIdValidation } = require('../validation');

// user request
// get by userId
router.get('/', verifyToken, async (req, res, next) => {
    const userId = req.user.user_id;
    
    try {
        const cart = await Cart.find(
            {
                userId: userId
            }    
        );
        if(!!cart) {
            res.status(200).send(cart);
        } else {
            next(createError(404, 'Cart data not found'));
        }
    } catch(error) {
        next(error);
    }
});

// user request
// any valid user can create cart
router.post('/', verifyToken, createCartEntry, async (req, res, next) => {
    const cart = req.cart;

    try {
        const savedCart = await cart.save();
        if(!!savedCart) {
            res.status(201).send(savedCart);
        } else {
            next(createError(500, 'Cart could not be saved'));
        }
    } catch(error) {
        next(error);
    }
});


// update 
// if one or more items are added or deleted we will call it update
router.put('/:id', verifyToken, mongoDbIdValidation, async (req, res, next) => {
    const body = req.body;

    try {
        const cart = await Cart.findById(req.params.id);
        if(!cart) {
            return next(createError(404, 'Cart not found. so can not be updated'));
        }
        // ownership check
        if(cart.userId !== req.user.user_id) {
            next(createError(403, 'Access Denied! This operation is permissible by only owner of this object'));
            return;
        }

        cart.totalPrice = body.totalPrice;
        cart.productList = body.productList;
        cart.updatedAt = Date.now();

        const updatedCart = await cart.save();
        if(!!updatedCart) {
            res.status(200).send(updatedCart);
        } else {
            next(createError(500, 'Cart can not be updated!'));
        }
    } catch(error) {
        next(error);
    }
})

// delete full cart
// if all items are deleted from cart, then delete can be call
// it will also automatically  need to be called after confirmation of order
router.delete('/:id', verifyToken, mongoDbIdValidation, async (req, res, next) => {
    try {
        const cart = await Cart.findById(req.params.id);
        if(!cart) {
            return next(createError(404, 'Cart not found. so can not be deleted'));
        }
        // ownership check
        if(cart.userId !== req.user.user_id) {
            next(createError(404, 'Access Denied! This operation is permissible by only owner of this object'));
            return;
        }

        cart = await cart.remove();

        if(!!cart) {
            console.log(cart);
            res.sendStatus(204);
        } else {
            next(createError(500, `cart ${req.params.id} can not be deleted`));
        }
    } catch(error) {
        next(error);
    }
});


module.exports = router;
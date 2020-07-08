const express = require('express');
const router = express.Router();
const createError = require('http-errors');

const { createCartEntry, verifyToken } = require('../middlewire');
const Cart = require('../models/Cart');

// user request
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
router.put('/:id', verifyToken, async (req, res, next) => {
    const body = req.body;

    try {
        const cart = await Cart.findById(req.params.id);
        if(!cart) {
            return next(createError(404, 'Cart not found. so can not be updated'));
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

router.delete('/:id', verifyToken, async (req, res, next)=> {
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);

        if(!!cart) {
            res.status(200).send(cart);
        } else {
            next(createError(404, `product ${req.params.id} not found!`));
        }
    } catch(error) {
        next(error);
    }
});


module.exports = router;
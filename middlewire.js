const Cart = require('./models/Cart');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

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

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if(!token)return next(createError(401, 'Access Denied! Token is invalid'));

    //verify a token symmetric
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        console.log(decoded);
        if(err) {
            next(createError(401, err));
        } else if (decoded.isAccessToken === false) {
            next(createError(401, 'Access Denied! Token is invalid'));
        } else {
            req.user = decoded;
            next();
        }
    });

}

module.exports.verifyToken = verifyToken;
module.exports.createCartEntry = createCartEntry;
module.exports.log = log;
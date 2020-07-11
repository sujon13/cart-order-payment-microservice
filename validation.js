const createError = require('http-errors');


const pageAndLimitValidation = async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    
    if(!Number.isInteger(page) || !Number.isInteger(limit)) {
        return next(createError(400, 'query parameter is invalid'));
    }

    req.page = page;
    req.limit = limit;
    next();
}

const inputValidationForGetOrder = async (req, res, next) => {
    const mongoDbIdChecker = new RegExp("^[0-9a-fA-F]{24}$");

    const userId = req.query.userId;
    if(userId !== undefined &&  mongoDbIdChecker.test(userId) === false) {
        return next(createError(400, 'userId is invalid'));
    }

    const orderId = req.query.orderId;
    if(orderId !== undefined && parseInt(orderId) === NaN) {
        return next(createError(400, 'orderId is invalid'));
    }

    const phoneNumberChecker = new RegExp("^01[3-9]{1}[0-9]{8}$");
    const phoneNumber= req.query.phoneNumber;
    if(phoneNumber !== undefined && phoneNumberChecker.test(phoneNumber) === false) {
        return next(createError(400, 'phoneNumber is invalid'));
    }

    next();

}

const mongoDbIdValidation = async (req, res, next) => {
    const mongoDbIdChecker = new RegExp("^[0-9a-fA-F]{24}$");
    const id = req.params.id;
    if(id === undefined) {
        next();
        return;
    }

    if(mongoDbIdChecker.test(id) === false) {
        return next(createError(400, 'id is invalid'));
    }
    next();
}

module.exports.pageAndLimitValidation = pageAndLimitValidation;
module.exports.inputValidationForGetOrder = inputValidationForGetOrder;
module.exports.mongoDbIdValidation= mongoDbIdValidation;
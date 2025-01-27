// Importing validation methods from express-validator
const { body, param, validationResult } = require('express-validator');


// Validation middleware for fine creation or update
const validateFine = [
    // Validate 'fine_amount' as a non-empty double/integer
    body('fine_amount')
        .isFloat()
        .withMessage('Fine amount must be a double or integer')
        .notEmpty()
        .withMessage('Fine amount is required'),

    // Validate 'transaction_id' as a non-empty integer
    body('transaction_id')
        .isInt()
        .withMessage('Transaction ID must be an integer')
        .notEmpty()
        .withMessage('Transaction ID is required'),

    // Validate 'fine_status' as a non-empty string with specific allowed values
    body('fine_status')
        .isString()
        .withMessage('Fine status must be a string')
        .isIn(['pending', 'paid'])
        .withMessage('Fine status must be either "unpaid" or "paid"')
        .notEmpty()
        .withMessage('Fine status is required'),

    // Validate 'paid_date' as a date 
    body('paid_date')
        .isDate()
        .withMessage('Paid Date must be a date')
        .optional(),

    // Check for validation errors and respond if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


// Validation middleware for fine ID parameter in the URL
const validateFineId = [
    // Validate 'id' as an integer
    param('id')
        .isInt()
        .withMessage('Fine ID must be an integer'),

    // Check for validation errors and respond if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


module.exports = {
    validateFine,
    validateFineId
};

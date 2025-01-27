// Importing validation methods from express-validator
const { body, param, validationResult } = require('express-validator');


// Validation middleware for transaction
const validateTransaction = [
    // Ensure 'return_date' is a date (optional)
    body('return_date')
        .optional()
        .isDate()
        .withMessage('return date must be a date'),

    // Ensure 'username' is a non-empmty string
    body('username')
        .notEmpty()
        .withMessage('username is required')
        .isString()
        .withMessage('username must be a string'),

    // Ensure 'book_id' is an integer (optional)
    body('book_id')
        .notEmpty()
        .withMessage('bookid is required')
        .isInt()
        .withMessage('bookid must be an integer'),

    // Check if there are validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for transaction creation
const createTransactionValidator = [
    body('username')
        .notEmpty()
        .withMessage('username is required')
        .isString()
        .withMessage('username must be a string'),
    body('title')
        .notEmpty()
        .withMessage('title is required')
        .isString()
        .withMessage('title must be a string'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


// Validation middleware for transaction ID parameter in the URL
const validateTransactionId = [
    // Validate 'id' as an integer
    param('id')
        .isInt()
        .withMessage('ID must be an integer'),

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
    validateTransaction,
    validateTransactionId,
    createTransactionValidator
};

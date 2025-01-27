// Importing validation methods from express-validator
const { body, param, validationResult } = require('express-validator');


// Validation middleware for author creation or update
const validateAuthor = [
    // Ensure 'first_name' is a non-empty string
    body('first_name')
        .notEmpty()
        .withMessage('First name is required')
        .isString()
        .withMessage('first name must be a string'),

    // Ensure 'last_name' is a non-empty string
    body('last_name')
        .notEmpty()
        .withMessage('Last name is required')
        .isString()
        .withMessage('last name must be a string'),

    // Check if there are validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


// Validation middleware for author ID parameter in the URL
const validateAuthorId = [
    // Ensure 'id' is an integer
    param('id').isInt().withMessage('Author ID must be an integer'),
    (req, res, next) => {
        // Check if there are validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


module.exports = {
    validateAuthor,
    validateAuthorId
};

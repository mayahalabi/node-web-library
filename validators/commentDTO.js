// Importing validation methods from express-validator
const { body, param, validationResult } = require('express-validator');


// Validation middleware for comment creation
const createCommentvalidator = [
    // Ensure 'comment_description' is a non-empty string
    body('comment_description')
        .isString()
        .withMessage('Comment description must be a string')
        .notEmpty()
        .withMessage('Comment description is required'),

    // Ensure 'rating' is an integer between 1 and 5
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),

    // Ensure 'title' is a non-empty string
    body('title')
        .isString()
        .withMessage('Title must be a string'),

    // Check for validation errors and respond if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


// Validation middleware for comment update
const updateCommentValidator = [
    body('comment_description')
        .isString()
        .withMessage('Comment description must be a string')
        .notEmpty()
        .withMessage('Comment description is required'),

    body('rating')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

    // Check for validation errors and respond if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


// Validation middleware for comment ID parameter in the URL
const validateCommentId = [
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
    createCommentvalidator,
    updateCommentValidator,
    validateCommentId
};

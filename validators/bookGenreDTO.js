const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a BookGenre entry
const validateBookGenre = [
    // Validate that book_Id is a positive integer
    body('book_id')
        .isInt({ min: 1 })
        .withMessage('Book ID must be a positive number'),

    // Validate that genre_Id is a positive integer
    body('genre_id')
        .isInt({ min: 1 })
        .withMessage('Genre ID must be a positive number'),

    // Middleware to check for validation errors and send a response if errors are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating BookGenre ID in route parameters
const validateBookGenreId = [
    // Validate that id parameter is an integer
    param('id').isInt().withMessage('ID must be an integer'),

    // Middleware to check for validation errors and send a response if errors are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateBookGenre,
    validateBookGenreId
};

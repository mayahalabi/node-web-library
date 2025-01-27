// Importing validation methods from express-validator
const { body, param, validationResult } = require('express-validator');


// Validation middleware for book creation or update
const validateBook = [
    // Ensure 'title' is a non-empty string
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isString()
        .withMessage('Title must be a string'),

    // Ensure 'isbn' is a non-empty string
    body('isbn')
        .notEmpty()
        .withMessage('ISBN is required')
        .isString()
        .withMessage('ISBN must be a string'),

    // Ensure 'publisher' is a string (optional)
    body('publisher')
        .optional()
        .isString()
        .withMessage('Publisher must be a string'),

    // Ensure 'publisher' is an integer (optional)
    body('published_year')
        .optional()
        .isInt()
        .withMessage('Published year must be an integer'),

    // Ensure 'status' is a non-empty string
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isString()
        .withMessage('Status must be a string'),

    // Ensure 'description' is a string (optional)
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),

    // Ensure 'author_id' is an integer
    body('author_id')
        .isInt()
        .withMessage('Author ID must be an integer'),

    // Ensure 'image_id' is an integer
    body('image_id')
        .isInt()
        .withMessage('Image ID must be an integer'),

    // Ensure 'quantity' is an integer
    body('quantity')
        .isInt()
        .withMessage('Quantity must be an integer'),

    // Ensure 'rate' is a integer between 1 and 5
    body('rate')
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


// Validation middleware for book ID parameter in the URL
const validateBookId = [
    param('book_id')
        .isInt()
        .withMessage('ID must be an integer'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateBook,
    validateBookId
};

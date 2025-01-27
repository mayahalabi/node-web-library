// Importing validation methods from express-validator
const { body, param, validationResult } = require('express-validator');


// Validation middleware for genre creation or update
const validateGenre = [
    // Ensure 'type' is a non-empty string
    body('type')
        .isString()
        .withMessage('type must be a string')
        .notEmpty()
        .withMessage('Type is required'),

    // Check if there are validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


// Validation middleware for genre ID parameter in the URL
const validateGenreId = [
    // Ensure 'id' is an integer
    param('id')
        .isInt()
        .withMessage('Genre ID must be an integer'),
    // Check if there are validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


module.exports = {
    validateGenre,
    validateGenreId
};

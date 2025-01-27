// Importing validation methods from express-validator
const { body, param, validationResult } = require('express-validator');


// Validation middleware for notification creation or update
const createNotificationValidator = [
    // Ensure 'transaction_id' is an integer
    body('transaction_id')
        .isInt()
        .withMessage('transaction id must be an integer'),

    // Check if there are validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];



// Validation middleware for notification ID parameter in the URL
const validateNotificationId = [
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
    validateNotificationId,
    createNotificationValidator
};

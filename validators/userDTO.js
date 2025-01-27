// Importing validation methods from express-validator
const { body, param, validationResult } = require('express-validator');


// Validation middleware for user creation or update
const validateUsername = [
    // Ensure 'first_name' is a non-empmty string
    body('first_name')
        .isString()
        .withMessage('First name must be a string')
        .notEmpty()
        .withMessage('First name is required'),

    // Ensure 'last_name' is a non-empmty string
    body('last_name')
        .isString()
        .withMessage('Last name must be a string')
        .notEmpty()
        .withMessage('Last name is required'),

    // Ensure 'username' is an email non-empty string
    body('email')
        .isString()
        .withMessage('Email must be a string')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .notEmpty()
        .withMessage('Email is required'),

    // Ensure 'phone number' is a mobile (optional)
    body('phone_number')
        .isMobilePhone()
        .withMessage('Phone number must be number')
        .optional(),

    // Ensure 'address' is a string (optional)
    body('address')
        .isString()
        .withMessage('Address must be a string')
        .optional(),

    // Ensure 'role' is a non-empmty string
    body('role')
        .isString()
        .withMessage('Role must be a string')
        .isIn(['administrator', 'user'])
        .withMessage('Role must be either "administrator" or "user"')
        .notEmpty()
        .withMessage('Role is required'),

    // Ensure 'password' is a non-empmty string
    body('password')
        .isString()
        .withMessage('Password must be a string')
        .notEmpty()
        .withMessage('Password is required'),

    // Check if there are validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validatePassword = [
    body('password')
        .isString()
        .withMessage('Password must be a string')
        .notEmpty()
        .withMessage('Password is required.'),

    // Check if there are validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

// Validation middleware for username parameter in the URL
const validateUserUsername = [
    param('username')
        .isString()
        .withMessage('Username must be a string')
        .notEmpty()
        .withMessage('Username is required'),

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
    validateUsername,
    validateUserUsername
};

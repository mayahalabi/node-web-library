// Import the Moment.js library for handling and formatting dates and times
const moment = require("moment");

/**
 * Represents an User in the system.
 * @class
 */
class User {

    /**
     * Creates an instance of the Transaction class.
     * @constructor
     * @param {string} username - The unique identifier for the user.
     * @param {string} first_name - The first name of the user.
     * @param {string} last_name - The last name of the user.
     * @param {email} email - The email of the user.
     * @param {string} phoneNumber - The phone number of the user.
     * @param {string} address - The address of the user.
     * @param {string} role - The role (user or admin).
     * @param {Date} registration_date - The date where the user created the account.
     * @param {string} password - The password of the user.
     * @param {Date} last_updatedAt - The date when the account was last updated.
     */
    constructor(username, first_name, last_name, email,
        phoneNumber, address, role, registration_date, password, last_updatedAt) {
        this.username = username;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.role = role;
        this.registration_date = registration_date;
        this.password = password;
        this.last_updatedAt = last_updatedAt;
    }

    /**
     * Converts a database row to a User instance.
     * @static
     * @param {Object} row - The database row representing a user.
     *@param {string} username - The unique identifier for the user.
     * @param {string} first_name - The first name of the user.
     * @param {string} last_name - The last name of the user.
     * @param {email} email - The email of the user.
     * @param {string} phoneNumber - The phone number of the user.
     * @param {string} address - The address of the user.
     * @param {string} role - The role (user or admin).
     * @param {Date} registration_date - The date where the user created the account.
     * @param {string} password - The password of the user.
     * @param {Date} last_updatedAt - The date when the account was last updated.
     * 
     * @returns {User} A new instance of the User class.
     */
    static fromRow(row) {
        return new User(
            row.username,
            row.first_name,
            row.last_name,
            row.email,
            row.phoneNumber,
            row.address,
            row.role,
            moment(row.registration_date).format("YYYY-MM-DD HH:mm:SS"),
            row.password,
            moment(row.last_updatedAt).format("YYYY-MM-DD HH:mm:SS")
        );
    }
}

module.exports = User;

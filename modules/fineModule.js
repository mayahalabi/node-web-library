// Import the Moment.js library for handling and formatting dates and times
const moment = require("moment");


/**
 * Represents a Fine in the system.
 * @class
 */
class Fine {

    /**
     * Creates an instance of the Fine class.
     * @constructor
     * @param {number} fine_id - The unique identifier for the fine.
     * @param {string} username - The username of the fine.
     * @param {number} transaction_id - The transaction of the fine.
     * @param {string} BorrowedBook - The title of the borrowed book that has fine.
     * @param {number} fine_amount - The amount of the fine.
     * @param {string} fine_status - The status of the fine.
     * @param {Date} paid_date - The paid date of the fine when the user paid.
     */
    constructor(fine_id, username, transaction_id, BorrowedBook, fine_amount, fine_status, paid_date) {
        this.fine_id = fine_id;
        this.username = username;
        this.transaction_id = transaction_id;
        this.BorrowedBook = BorrowedBook;
        this.fine_amount = fine_amount;
        this.fine_status = fine_status;
        this.paid_date = paid_date;
    }

    /**
     * Converts a database row to a Fine instance.
     * @static
     * @param {Object} row - The database row representing a fine.
     * @param {number} row.fine_id - The unique identifier for the fine.
     * @param {string} row.username - The username of the fine.
     * @param {number} row.transaction_id - The transaction of the fine.
     * @param {string} row.BorrowedBook - The title of the borrowed book that has fine.
     * @param {number} row.fine_amount - The amount of the fine.
     * @param {string} row.fine_status - The status of the fine.
     * @param {Date} row.paid_date - The paid date of the fine when the user paid.
     * @returns {Fine} A new instance of the Fine class.
     */
    static fromRow(row) {
        return new Fine(
            row.fine_id,
            row.username,
            row.transaction_id,
            row.BorrowedBook,
            row.fine_amount,
            row.fine_status,
            moment(row.paid_date).format("YYYY-MM-DD HH:mm:SS")
        );
    }
}

module.exports = Fine;

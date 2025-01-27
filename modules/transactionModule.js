// Import the Moment.js library for handling and formatting dates and times
const moment = require("moment");


class Transaction {

    /**
    * Constructs a new `Transaction` object with the provided details.
    * 
    * @param {number} transaction_id - Unique identifier for the transaction.
    * @param {string} username - The username of the person who borrowed the book.
    * @param {number} book_id - Unique identifier for the book being borrowed.
    * @param {string} issue_date - The date and time when the book was issued.
    * @param {string} due_date - The date and time when the book is due to be returned.
    * @param {string|null} return_date - The date and time when the book was actually returned (can be null if not yet returned).
    */
    constructor(transaction_id, username, book_id, issue_date, due_date, return_date) {
        this.transaction_id = transaction_id;
        this.username = username;
        this.book_id = book_id;
        this.issue_date = issue_date;
        this.due_date = due_date;
        this.return_date = return_date;
    }

    /**
    * Converts a database row to a `Transaction` object.
    * 
    * This method is used to map a database row (e.g., from a SQL query result) to a `Transaction` object,
    * ensuring that the date fields are formatted properly using `moment`.
    * 
    * @param {Object} row - A database row containing the transaction details.
    * @returns {Transaction} The `Transaction` object created from the database row.
    */
    static fromRow(row) {
        return new Transaction(
            row.transaction_id,
            row.username,
            row.book_id,
            moment(row.issue_date).format("YYYY-MM-DD HH:mm:SS"),
            moment(row.due_date).format("YYYY-MM-DD HH:mm:SS"),
            moment(row.return_date).format("YYYY-MM-DD HH:mm:SS")
        );
    }
}

module.exports = Transaction;

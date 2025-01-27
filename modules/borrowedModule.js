const moment = require("moment");

class Borrowed {

    /**
    * Constructs a new `Borrowed` object with the provided details.
    * 
    * @param {number} transaction_id - Unique identifier for the transaction.
    * @param {string} username - The username of the person who borrowed the book.
    * @param {number} book_id - Unique identifier for the book being borrowed.
    * @param {string} title - Title of the book being borrowed.
    * @param {string} issue_date - The date and time when the book was issued.
    * @param {string} due_date - The date and time when the book is due to be returned.
    * @param {string|null} return_date - The date and time when the book was actually returned (can be null if not yet returned).
    * @param {Buffer} image_data - Binary data for the book's image (if available).
    * @param {string} image_type - The MIME type of the image (e.g., 'image/jpeg').
    */
    constructor(transaction_id, username, book_id, title, issue_date, due_date, return_date, image_data, image_type) {
        this.transaction_id = transaction_id;
        this.username = username;
        this.book_id = book_id;
        this.title = title;
        this.issue_date = issue_date;
        this.due_date = due_date;
        this.return_date = return_date;
        this.image_data = image_data;
        this.image_type = image_type;
    }

    /**
    * Converts a database row to a `Borrowed` object.
    * 
    * This method is used to map a database row (e.g., from a SQL query result) to a `Borrowed` object,
    * ensuring that the date fields are formatted properly using `moment` and any null values are handled.
    * 
    * @param {Object} row - A database row containing the book borrowing details.
    * @returns {Borrowed} The `Borrowed` object created from the database row.
    */
    static fromRow(row) {
        return new Borrowed(
            row.transaction_id,
            row.username,
            row.book_id,
            row.title,
            moment(row.issue_date).format("YYYY-MM-DD HH:mm:ss"),
            moment(row.due_date).format("YYYY-MM-DD HH:mm:ss"),
            row.return_date ? moment(row.return_date).format("YYYY-MM-DD HH:mm:ss") : null,  // Handle null return_date
            row.image_data,
            row.image_type
        );
    }
}

module.exports = Borrowed;

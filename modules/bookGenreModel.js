// Importing moment for potential date manipulation
const moment = require("moment");

/**
 * Represents a BookGenre in the system.
 * @class
 */
class BookGenre {

    /**
     * Constructor to initialize a BookGenre object.
     * @param {number} genre_Id - ID of the genre
     * @param {number} book_Id - ID of the book
     */
    constructor(genre_id, book_id) {
        this.book_id = book_id;
        this.genre_id = genre_id;
    }

    /**
     * Static method to create a BookGenre instance from a database row.
     * @param {object} row - The database row containing BookGenre data
     * @returns {BookGenre} - New BookGenre instance
     */
    static fromRow(row) {
        return new BookGenre(
            row.genre_id,
            row.book_id
        );
    }
}

// Exporting the BookGenre class to use in other modules
module.exports = BookGenre;

/**
 * Represents a Book in the system.
 * @class
 */
class Book {

    /**
     * Creates an instance of the Book class.
     * @constructor
     * @param {number} book_id - The unique identifier for the book.
     * @param {array} type - The types (genres) of the book.
     * @param {number} author_id - The author of the book.
     * @param {number} image_id - The image id of the book.
     * @param {string} isbn - The ISBN of the book.
     * @param {string} title - The title of the book.
     * @param {string} publisher - The publisher of the book.
     * @param {Date} published_year - The published year of the book.
     * @param {string} status - The status of the book.
     * @param {number} quantity - The quantity of the book.
     * @param {number} rate - The rate of the book.
     * @param {string} description - The description of the book.
     */
    constructor(book_id, type, author_id, first_name, last_name, image_id, isbn, title, publisher, published_year, status, quantity, rate, description, image_data) {
        this.book_id = book_id;
        this.type = type;
        this.author_id = author_id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.image_id = image_id;
        this.isbn = isbn;
        this.title = title;
        this.publisher = publisher;
        this.published_year = published_year;
        this.status = status;
        this.quantity = quantity;
        this.rate = rate;
        this.description = description;
        this.image_data = image_data;
    }

    /**
     * Converts a database row to a Book instance.
     * @static
     * @param {Object} row - The database row representing a book.
     * @returns {Book} A new instance of the Book class.
     */
    static fromRow(row) {
        const base64ImageData = row.image_data.toString('base64');
        return new Book(
            row.book_id,
            row.genres ? row.genres.split(',') : ['No genres'],  // Now 'type' is always an array of genres
            row.author_id,
            row.first_name,    // Author's first name
            row.last_name,     // Author's last name
            row.image_id,
            row.isbn,
            row.title,
            row.publisher,
            row.published_year,
            row.status,
            row.quantity,
            row.rate,
            row.description,
            // base64ImageData
            // row.image_data.toString('base64') // Convert image data to Base64
            row.image_data // ? row.image_data.toString('base64') : null
        );
    }
}

module.exports = Book;


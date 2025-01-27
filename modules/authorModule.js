/**
 * Represents an Author in the system.
 * @class
 */
class Author {

    /**
     * Creates an instance of the Author class.
     * @constructor
     * @param {number} author_id - The unique identifier for the author.
     * @param {string} first_name - The first name of the author.
     * @param {string} last_name - The last name of the author.
     */
    constructor(author_id, first_name, last_name) {
        this.author_id = author_id;
        this.first_name = first_name;
        this.last_name = last_name;
    }

    /**
     * Converts a database row to a Author instance.
     * @static
     * @param {Object} row - The database row representing an author.
     * @param {number} row.genre_id - The unique identifier for the author.
     * @param {string} row.first_name - The first name of the author.
     * @param {string} row.last_name - The last name of the author.
     * @returns {Author} A new instance of the Author class.
     */
    static fromRow(row) {
        return new Author(
            row.author_id,
            row.first_name,
            row.last_name
        );
    }
}

module.exports = Author;

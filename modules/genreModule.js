/**
 * Represents a Genre in the system.
 * @class
 */
class Genre {

    /**
     * Creates an instance of the Genre class.
     * @constructor
     * @param {number} genre_id - The unique identifier for the genre.
     * @param {string} type - The type or name of the genre.
     **/
    constructor(genre_id, type) {
        this.genre_id = genre_id;
        this.type = type;
    }

    /**
     * Converts a database row to a Genre instance.
     * @static
     * @param {Object} row - The database row representing a genre.
     * @param {number} row.genre_id - The unique identifier for the genre.
     * @param {string} row.type - The type or name of the genre.
     * @returns {Genre} A new instance of the Genre class.
     */
    static fromRow(row) {
        return new Genre(
            row.genre_id,
            row.type
        );
    }
}

module.exports = Genre;

// Importing the database initialization function
const { initDB } = require('../config/database');

// Importing the Genre model for interacting with genre data
const Genre = require('../modules/genreModule');

class GenreService {

    // Constructor initializes the database connection pool
    constructor() {
        this.pool = null;    // Database connection pool
        this.init();        //  Initialize database connection
    }

    /**
     * Initializes the database connection pool.
     * This method is called when the GenreService is instantiated.
     */
    async init() {
        // Initialize the database connection pool
        this.pool = await initDB();
    }

    /**
    * Retrieves all genres from the database.
    * 
    * @returns {Promise<Array>} - A promise that resolves to an array of Genre objects.
    * @throws {Error} - Throws an error if the query execution fails.
    */
    async getAllGenres() {
        // Query the database to get all genres
        const [rows] = await this.pool.query('SELECT * FROM genre');

        // Map the rows to Genres instances
        return rows.map(row => Genre.fromRow(row));
    }

    /**
    * Retrieves a specific genre by its ID.
    * 
    * @param {number} id - The ID of the genre to retrieve.
    * @returns {Promise<Genre|null>} - A promise that resolves to a Genre object or null if the genre is not found.
    * @throws {Error} - Throws an error if the query execution fails.
    */
    async getGenreById(id) {
        // Query the database for a genre with the specified id
        const [rows] = await this.pool.query(
            'SELECT * FROM genre WHERE genre_id = ?', [id]
        );

        // If no genre is found, return null
        if (rows.length === 0) return null

        // Return the Genre instance created from the first row
        return Genre.fromRow(rows[0]);
    }

    /**
    * Creates a new genre in the database.
    * 
    * @param {Object} genreData - An object containing the genre data to create.
    * @param {string} genreData.type - The genre type (name).
    * @returns {Promise<Genre>} - A promise that resolves to the created Genre object.
    * @throws {Error} - Throws an error if the genre type already exists in the database.
    */
    async createGenre(genreData) {
        const { type } = genreData;

        // Check if the type already exists
        const [exists] = await this.pool.query('SELECT type FROM genre WHERE type = ?', [type]);
        if (exists.length > 0) {
            throw new Error(`Genre type "${type}" already exists.`);
        }

        // Insert the type through query
        const [result] = await this.pool.query('INSERT INTO genre (type) VALUES (?)', [type]);

        // Create a Genre object with the inserted data
        const insertedGenre = new Genre(result.insertId, type);

        // Return the created Genre object
        return insertedGenre;
    }

    /**
    * Updates an existing genre by its ID.
    * 
    * @param {number} id - The ID of the genre to update.
    * @param {Object} genreData - An object containing the updated genre data.
    * @param {string} genreData.type - The updated genre type (name).
    * @returns {Promise<boolean>} - A promise that resolves to true if the genre was successfully updated, or false if no changes were made.
    * @throws {Error} - Throws an error if the genre is not found, if no changes were made, or if the type already exists.
    */
    async updateGenre(id, genreData) {
        const { type } = genreData;

        // Check if the genre with the specified ID exists and retrieve its current type
        const [currentGenre] = await this.pool.query('SELECT type FROM genre WHERE genre_id = ?', [id]);
        if (currentGenre.length === 0) {
            throw new Error('Genre not found.');
        }

        // Check if the type has changed
        if (currentGenre[0].type === type) {
            throw new Error('No changes made; type is already set to this value.');
        }

        // Check if the type already exists
        const [exists] = await this.pool.query('SELECT type FROM genre WHERE type = ?', [type]);
        if (exists.length > 0) {
            throw new Error(`Genre type "${type}" already exists.`);
        }

        // Update the genre's information in the database
        const [result] = await this.pool.query(
            'UPDATE genre SET type = ? WHERE genre_id = ?',
            [type, id]
        );

        // Return whether any rows were affected (indicating success)
        return result.affectedRows > 0;
    }

    /**
    * Deletes a genre from the database by its ID.
    * The genre cannot be deleted if it is associated with any books.
    * 
    * @param {number} id - The ID of the genre to delete.
    * @returns {Promise<boolean>} - A promise that resolves to true if the genre was successfully deleted, or false if no rows were affected.
    * @throws {Error} - Throws an error if the genre is not found or is associated with books.
    */
    async deleteGenre(id) {
        // Check if the genre with the specified ID exists and retrieve its current type
        const [currentGenre] = await this.pool.query('SELECT genre_id FROM genre WHERE genre_id = ?', [id]);

        // If no genre is found, throw an error
        if (currentGenre.length === 0) {
            throw new Error('Genre not found.');
        }

        // Check if the genre is associated with any books
        const [books] = await this.pool.query('SELECT * FROM bookgenres WHERE genre_id = ?', [id]);
        if (books.length > 0) {
            throw new Error('Genre cannot be deleted as it is associated with existing books.');
        }

        // Proceed with deleting the genre from the database
        const [result] = await this.pool.query('DELETE FROM genre WHERE genre_id = ?', [id]);

        // Return true if the genre was successfully deleted, otherwise false
        return result.affectedRows > 0;
    }
}

module.exports = new GenreService();
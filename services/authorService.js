// Importing the database initialization function
const { initDB } = require('../config/database');

// Importing the Author model for interacting with author data
const Auhtor = require('../modules/authorModule');


class AuthorService {

    // Constructor initializes the database connection pool
    constructor() {
        this.pool = null;     // Database connection pool
        this.init();         //  Initialize database connection
    }

    /**
     * Initializes the database connection pool.
     * This method is called when the AuthorService is instantiated.
     */
    async init() {
        // Initialize the database connection pool
        this.pool = await initDB();
    }

    /**
     * Fetches all authors from the database.
     * This method queries the database and returns a list of all authors.
     * It maps the rows from the database to Author instances.
     * 
     * @returns {Array} An array of Author instances
     */
    async getAllAuthors() {
        // Query the database to get all authors
        const [rows] = await this.pool.query('SELECT * FROM author');

        // Map the rows to Author instances and return them
        return rows.map(Auhtor.fromRow);
    }

    /**
     * Fetches an author by their ID from the database.
     * If the author is not found, it returns null.
     * 
     * @param {number} id - The ID of the author to fetch.
     * @returns {Author|null} The Author instance if found, or null if not found.
     */
    async getAuthorById(id) {
        // Query the database for a author with the specified id
        const [rows] = await this.pool.query('SELECT * FROM author WHERE author_id = ?', [id]);

        // If no author is found, return null
        if (rows.length == 0) return null;

        // Return the Author instance created from the first row
        return Auhtor.fromRow(rows[0]);
    }

    /**
     * Creates a new author in the database.
     * This method checks if the author already exists before inserting.
     * If the author already exists, it throws an error.
     * 
     * @param {Object} authorData - The data for the new author, including first_name and last_name.
     * @returns {Author} The created Author instance.
     */

    async createAuthor(authorData) {
        const { first_name, last_name } = authorData;

        // Check if the author already exists by comparing first and last name
        const [exists] = await this.pool.query('SELECT first_name, last_name FROM author WHERE first_name = ? and last_name = ?',
            [first_name, last_name]);
        if (exists.length > 0) {
            throw new Error(`Author "${first_name}" "${first_name}" already exists.`);
        }

        // Insert the author through query
        const [result] = await this.pool.query(
            'INSERT INTO author (first_name, last_name) VALUES (?, ?)', [first_name, last_name]
        );

        // Create a new Author instance with the inserted ID and returned data
        const insertedAuthor = new Auhtor(result.insertId, first_name, last_name);

        // Return the created Author instance
        return insertedAuthor;
    }

    /**
     * Updates an existing author's details in the database.
     * It first checks if the author exists and whether the new name already exists.
     * 
     * @param {number} id - The ID of the author to update.
     * @param {Object} authorData - The new data for the author (first_name, last_name).
     * @returns {boolean} True if the author was successfully updated, false if not.
     */
    async updateAuthor(id, authorData) {
        const { first_name, last_name } = authorData;

        // Check if the author with the specified ID exists
        const [currentAuthor] = await this.pool.query('SELECT first_name, last_name FROM author WHERE author_id = ?', [id]);

        if (currentAuthor.length === 0) {
            throw new Error('Author not found.'); // Throw an error if the author doesn't exist
        }

        // Check if an author with the same name already exists
        const [exists] = await this.pool.query('SELECT first_name, last_name FROM author WHERE first_name = ? and last_name = ?',
            [first_name, last_name]);
        if (exists.length > 0) {
            // Throw an error if the name already exists
            throw new Error(`Author: "${first_name}" "${last_name}" already exists.`);
        }

        // Update the author's information in the database
        const [result] = await this.pool.query(
            'UPDATE author SET first_name = ?, last_name = ? WHERE author_id = ?',
            [first_name, last_name, id]
        );

        // Return whether any rows were affected (indicating success)
        return result.affectedRows > 0;
    }

    /**
     * Deletes an author by their ID.
     * The method first checks if the author exists and if they are associated with any books.
     * If the author has associated books, they cannot be deleted.
     * 
     * @param {number} id - The ID of the author to delete.
     * @returns {boolean} True if the author was deleted, false if not.
     */
    async deleteAuthor(id) {

        // Check if the author with the specified ID exists
        const [currentAuthor] = await this.pool.query('SELECT author_id FROM author WHERE author_id = ?', [id]);

        // If no author is found, throw an error
        if (currentAuthor.length === 0) {
            throw new Error('Author not found.');
        }

        // Check if the author is associated with any books
        const [books] = await this.pool.query('SELECT * FROM book WHERE author_id = ?', [id]);
        if (books.length > 0) {
            throw new Error('Author cannot be deleted as it is associated with existing books.');
        }

        // Proceed with deletion if no books are found
        const [result] = await this.pool.query('DELETE FROM author WHERE author_id = ?', [id]);
        return result.affectedRows > 0; // Indicate success or failure of deletion
    }

    /**
     * Checks whether an author with the specified ID exists in the database.
     * 
     * @param {number} id - The ID of the author to check.
     * @returns {boolean} True if the author exists, false otherwise.
     */
    async checkAuthorExists(id) {
        // Query the database to check if an author with the specified ID exists
        const [rows] = await this.pool.query('SELECT author_id FROM author WHERE author_id = ?',
            [id]);

        // Return true if any rows were found, indicating that the author exists
        return rows.length > 0;
    }
}

module.exports = new AuthorService();
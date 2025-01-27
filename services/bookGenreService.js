// Importing the database initialization function and the BookGenre model
const { initDB } = require('../config/database');
const BookGenre = require('../modules/bookGenreModel');

/**
 * bookGenreService handles the operations related to the book-genre associations in the database.
 * It provides methods to create, read, update, and delete book-genre relationships.
 * 
 * @class bookGenreService
 */
class bookGenreService {
    constructor() {
        this.pool = null; // Initialize the database connection pool
        this.init(); // Call the init method to set up the connection pool
    }

    /**
     * Initializes the database connection pool.
     * This method is called automatically when an instance of the service is created.
     * @returns {Promise<void>} - Returns a promise once the database connection pool is set up.
     */
    async init() {
        this.pool = await initDB(); // Initialize the database connection pool
    }

    /**
     * Get all entries in the bookgenre table, i.e., all book-genre associations.
     * @returns {Promise<BookGenre[]>} - Returns an array of BookGenre objects.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getAllBookGenres() {
        try {
            const [rows] = await this.pool.query('SELECT * FROM bookgenres'); // Query to fetch all book-genre associations
            return rows.map(BookGenre.fromRow); // Map the rows to BookGenre objects using the fromRow method
        } catch (e) {
            throw new Error(`Error fetching book/genre associations: ${e.message}`); // Throw error if fetching fails
        }
    }

    /**
     * Get all genres associated with a specific book by its ID.
     * @param {number} bookId - The ID of the book.
     * @returns {Promise<BookGenre[] | null>} - Returns an array of BookGenre objects or null if no associations found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getBookGenreByBookId(bookId) {
        try {
            const [rows] = await this.pool.query(
                `SELECT * FROM bookgenres WHERE book_id = ?`, [bookId] // Query to fetch genres for a specific book
            );
            if (rows.length === 0) return null; // Return null if no genres are associated with the book
            return rows.map(BookGenre.fromRow); // Map the rows to BookGenre objects
        } catch (e) {
            throw new Error(`Error fetching genres by book ID: ${e.message}`); // Throw error if fetching fails
        }
    }

    /**
     * Get all books associated with a specific genre by its ID.
     * @param {number} genreId - The ID of the genre.
     * @returns {Promise<BookGenre[] | null>} - Returns an array of BookGenre objects or null if no associations found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getBookGenreByGenreId(genreId) {
        try {
            const [rows] = await this.pool.query(
                `SELECT * FROM bookgenres WHERE genre_id = ?`, [genreId] // Query to fetch books for a specific genre
            );
            if (rows.length === 0) return null; // Return null if no books are associated with the genre
            return rows.map(BookGenre.fromRow); // Map the rows to BookGenre objects
        } catch (e) {
            throw new Error(`Error fetching books by genre ID: ${e.message}`); // Throw error if fetching fails
        }
    }

    /**
     * Create a new book-genre association in the database.
     * @param {object} param0 - The object containing book_Id and genre_Id.
     * @param {number} param0.book_Id - The ID of the book.
     * @param {number} param0.genre_Id - The ID of the genre.
     * @returns {Promise<{book_Id: number, genre_Id: number} | string>} - Returns the created association or an error message if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async createBookGenre({ book_Id, genre_Id }) {
        try {
            // Check if the book exists
            const [bookRows] = await this.pool.query(
                `SELECT book_id FROM book WHERE book_id = ?`, [book_Id]
            );
            if (bookRows.length === 0) {
                console.error(`Book with ID ${book_Id} not found.`);
                return 'Book not found'; // Return error message if the book is not found
            }

            // Check if the genre exists
            const [genreRows] = await this.pool.query(
                `SELECT genre_id FROM genre WHERE genre_id = ?`, [genre_Id]
            );
            if (genreRows.length === 0) {
                console.error(`Genre with ID ${genre_Id} not found.`);
                return 'Genre not found'; // Return error message if the genre is not found
            }

            // Insert the association in the bookgenre table
            const [insertResult] = await this.pool.query(
                `INSERT INTO bookgenres (book_id, genre_id) VALUES (?, ?)`,
                [book_Id, genre_Id]
            );

            console.log(`Association created: Book ID ${book_Id} with Genre ID ${genre_Id}`);
            return { book_Id, genre_Id }; // Return the association created
        } catch (e) {
            console.error(`Error in createBookGenre: ${e.message}`);
            throw new Error(`Error creating book-genre association: ${e.message}`); // Throw error if creating fails
        }
    }

    /**
     * Delete a book-genre association by book_Id and genre_Id.
     * @param {number} book_Id - The ID of the book.
     * @param {number} genre_Id - The ID of the genre.
     * @returns {Promise<boolean>} - Returns true if the deletion was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async deleteBookGenre(book_Id, genre_Id) {
        try {
            const [result] = await this.pool.query(
                `DELETE FROM bookgenres WHERE book_id = ? AND genre_id = ?`,
                [book_Id, genre_Id]
            );
            return result.affectedRows > 0; // Return whether the deletion was successful
        } catch (e) {
            throw new Error(`Error deleting book-genre association: ${e.message}`); // Throw error if deleting fails
        }
    }

    /**
     * 
     * @param {number} oldBookId - The old book ID.
     * @param {number} oldGenreId - The old genre ID.
     * @param {number} newBookId - The new book ID.
     * @param {number} newGenreId - The new genre ID.
     * @returns {Promise<boolean>} - Returns true if the update was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async updateBookGenre(bookId, genreId, newBookId, newGenreId) {
        try {
            const [result] = await this.pool.query(
                `UPDATE bookgenres SET book_id = ?, genre_id = ? 
                 WHERE book_id = ? AND genre_id = ?`,
                [newBookId, newGenreId, bookId, genreId]
            );
            return result.affectedRows > 0; // Return whether the update was successful
        } catch (e) {
            throw new Error(`Error updating book-genre association: ${e.message}`); // Throw error if updating fails
        }
    }
}

module.exports = new bookGenreService(); // Export a new instance of the service

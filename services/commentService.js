// Importing the database initialization function
const { initDB } = require('../config/database');

// Importing the Comment model for interacting with fine data
const Comment = require('../modules/commentModule');

class CommentService {

    // Constructor initializes the database connection pool
    constructor() {
        this.pool = null;      // Database connection pool
        this.init();          //  Initialize database connection
    }

    /**
     * Initializes the database connection pool.
     * This method is called when the CommentService is instantiated.
     */
    async init() {
        // Initialize the database connection pool
        this.pool = await initDB();
    }

    /**
    * Retrieves all comments from the database, including the associated book details.
    * 
    * @returns {Promise<Array>} - A promise that resolves to an array of Comment objects.
    * @throws {Error} - Throws an error if the query execution fails.
    */
    async getAllComments() {
        // Query the database to get all comments
        const [rows] = await this.pool.query(`SELECT 
            comment_id,
            c.book_id,
            c.username,
            title,
            comment_date,
            rating,
            comment_description
            FROM comment c, book b
            WHERE c.book_id = b.book_id`);

        // Map the rows to Comments instances
        // return rows.map(row => Comment.fromRow(row));
        return rows.map(Comment.fromRow);
    }

    /**
    * Retrieves a specific comment by its ID, along with associated book details.
    * 
    * @param {number} id - The ID of the comment to retrieve.
    * @returns {Promise<Comment|null>} - A promise that resolves to a Comment object or null if no comment is found.
    * @throws {Error} - Throws an error if the query execution fails.
    */
    async getCommentById(id) {
        // Query the database for a comment with the specified id
        const [rows] = await this.pool.query(`SELECT 
            comment_id,
            c.book_id,
            c.username,
            title,
            comment_date,
            rating,
            comment_description
            FROM comment c, book b
            WHERE c.book_id = b.book_id
            AND comment_id = ?`, [id]);

        // If no comment is found, return null
        if (rows.length == 0) return null;

        // Return the Comment instance created from the first row
        return Comment.fromRow(rows[0]);
    }

    /**
    * Retrieves all comments for a specific book, including the username of the commenter.
    * 
    * @param {number} id - The ID of the book whose comments are to be retrieved.
    * @returns {Promise<Array|null>} - A promise that resolves to an array of Comment objects, or null if no comments are found.
    * @throws {Error} - Throws an error if the query execution fails.
    */
    async getCommentByBookId(id) {
        // Query the comments from database for a book with the specified id
        const [rows] = await this.pool.query(`SELECT 
        c.comment_id,
        c.book_id,
        u.username,
        b.title,
        c.comment_date,
        c.rating,
        c.comment_description
    FROM 
        comment c
    INNER JOIN 
        book b ON c.book_id = b.book_id
    INNER JOIN 
        user u ON c.username = u.username
    WHERE 
        c.book_id = ?
            `, [id]);

        // If no comment is found, return null
        if (rows.length == 0) return null;

        // Return the Comment instance created from the fetched row
        return rows.map(row => Comment.fromRow(row));
    }

    /**
    * Creates a new comment for a book and saves it to the database.
    * 
    * @param {Object} commentData - An object containing the data for the new comment.
    * @param {string} commentData.comment_description - The content of the comment.
    * @param {number} commentData.rating - The rating given to the book (e.g., 1 to 5).
    * @param {number} commentData.book_id - The ID of the book being commented on.
    * @param {string} commentData.username - The username of the person creating the comment.
    * @returns {Promise<Comment>} - A promise that resolves to the created Comment object.
    * @throws {Error} - Throws an error if the book does not exist or if the insertion fails.
    */
    async createComment(commentData) {
        const { comment_description, rating, book_id, username } = commentData;

        // Check if the book_id exists in the book table
        const [rows] = await this.pool.query(
            'SELECT book_id FROM book WHERE book_id = ?', [book_id]
        );

        // Proceed with inserting the comment into the database
        if (rows.length === 0) {
            throw new Error(`Book_id "${book_id}" does not exist in the book table`);
        }

        // Proceed with inserting the comment if book_id is valid
        const [result] = await this.pool.query(
            'INSERT INTO comment (book_id, username, rating, comment_date, comment_description) VALUES (?, ?, ?, NOW(), ?)',
            [book_id, username, rating, comment_description]  // Using the correct variables
        );

        // Create the inserted comment instance
        const insertedComment = new Comment(result.insertId, book_id, username, rating, new Date(), comment_description);

        // Return the created Comment object
        return insertedComment;
    }



    /**
    * Updates an existing comment based on its ID.
    * 
    * @param {number} id - The ID of the comment to update.
    * @param {Object} commentData - An object containing the new data for the comment.
    * @param {string} commentData.comment_description - The updated comment description.
    * @param {number} commentData.rating - The updated rating.
    * @returns {Promise<boolean>} - A promise that resolves to true if the update is successful, or false if no changes were made.
    * @throws {Error} - Throws an error if the comment is not found or if no changes are made.
    */
    async updateComment(id, commentData) {
        const { comment_description, rating } = commentData;

        // Check if the comment with the specified ID exists
        const [currentComment] = await this.pool.query('SELECT comment_description, rating FROM comment WHERE comment_id = ?', [id]);
        if (currentComment.length === 0) {
            throw new Error('Comment not found.');
        }

        // If no changes were made, throw an error
        const existingComment = currentComment[0];
        if (
            existingComment.comment_description === comment_description &&
            existingComment.rating === rating
        ) {
            throw new Error('No changes made; Comment is already set to this value.');
        }

        // Update the comment according to comment id
        const [result] = await this.pool.query(
            'UPDATE comment SET comment_date = NOW(), comment_description = ?, rating = ? WHERE comment_id = ?',
            [comment_description, rating, id]
        );

        // Return whether any rows were affected (indicating success)
        return result.affectedRows > 0;
    }

    /**
    * Deletes a comment from the database based on its ID.
    * 
    * @param {number} id - The ID of the comment to delete.
    * @returns {Promise<boolean>} - A promise that resolves to true if the deletion is successful, or false if no rows were affected.
    * @throws {Error} - Throws an error if the query execution fails.
    */
    async deleteComment(id) {
        const [result] = await this.pool.query('DELETE FROM comment WHERE comment_id = ?', [id]);
        return result.affectedRows > 0; // Indicate success or failure of deletion
    }
}

module.exports = new CommentService();
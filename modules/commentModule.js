// Import the Moment.js library for handling and formatting dates and times
const moment = require("moment");

/**
 * Represents a Comment in the system.
 * @class
 */
class Comment {



    /**
     * Creates an instance of the Comment class.
     * @constructor
     * @param {number} comment_id - The unique identifier for the comment.
     * @param {number} book_id - The book id corresponding a fine.
     * @param {string} title - The book title of the fine.
     * @param {Date} comment_date - The date of the created comment.
     * @param {number} rating - The rating of the book (1-5).
     * @param {string} comment_description - The description of the comment.
     */
    constructor(comment_id, book_id, username, rating, comment_date, comment_description) {
        this.comment_id = comment_id;
        this.book_id = book_id;
        this.username = username;
        this.comment_date = comment_date;
        this.rating = rating;
        this.comment_description = comment_description;
    }

    /**
     * Converts a database row to a Comment instance.
     * @static
     * @param {Object} row - The database row representing a comment.
     * @param {number} row.comment_id - The unique identifier for the comment.
     * @param {number} row.book_id - The book id corresponding a fine.
     * @param {string} row.title - The book title of the fine.
     * @param {Date}   row.comment_date - The date of the created comment.
     * @param {number} row.rating - The rating of the book (1-5).
     * @param {string} row.comment_description - The description of the comment.
     * @returns {Comment} A new instance of the Comment class.
     */
    static fromRow(row) {
        return new Comment(
            row.comment_id,
            row.book_id,
            row.username,
            row.rating,
            moment(row.comment_date).format("YYYY-MM-DD HH:mm:SS"),
            row.comment_description
        );
    }
}

module.exports = Comment;

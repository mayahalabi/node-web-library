// Importing the comment service to handle comment-related operations
const commentService = require('../services/commentService');
const bookService = require('../services/bookService');
const userService = require('../services/userService');
const notifier = require('node-notifier'); // Importing node-notifier for desktop notifications
const path = require('path'); // Path module to resolve file paths for notification icons

// CommentController class manages the CRUD operations for comments
class CommentController {

    /**
    * Retrieves all comments from the comment service.
    * 
    * @param {Object} req - The request object
    * @param {Object} res - The response object
    * @returns {Promise<void>} Sends a JSON response with all comments
    */
    async getAllComments(req, res) {
        try {
            // Fetch all comments from the comment service
            const comments = await commentService.getAllComments();

            // Send the list of comments as a JSON response
            // res.json(comments);
            res.render('CommentViews/comments', { comments: comments });
        } catch (error) {
            // Handle errors and respond with an internal server error
            console.error('Error fetching comments:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Retrieves all comments for the admin dashboard.
    * 
    * This function fetches all the comments from the comment service and renders 
    * the 'comments' view, passing the fetched comments as data to be displayed.
    * If an error occurs, it sends a 500 error response with a failure message.
    * 
    * @param {Object} req - The request object, representing the HTTP request.
    * @param {Object} res - The response object, used to send a response to the client.
    * @returns {Promise<void>} Renders the 'comments' view or sends a 500 error response in case of failure.
    */
    async getAllCommentsADMIN(req, res) {
        try {
            // Fetch all comments from the comment service
            const comments = await commentService.getAllComments();

            // Send the list of comments as a JSON response
            // res.json(comments);

            res.render('CommentViews/comments', { comments: comments });
        } catch (error) {
            // Handle errors and respond with an internal server error
            console.error('Error fetching comments:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Retrieves a specific comment by its ID.
    * 
    * @param {Object} req - The request object containing the comment ID
    * @param {Object} res - The response object
    * @returns {Promise<void>} Sends a JSON response with the comment data
    */
    async getCommentById(req, res) {
        try {
            // Get the comment ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Fetch the comment by ID from the comment service
            const comment = await commentService.getCommentById(id);

            // If comment is not found, send a 404 response
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // If comment is found, respond with the comment data
            res.json(comment);

        } catch (error) {
            // Respond with an internal server error if something goes wrong
            console.error('Error fetching comment:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Retrieves comments for a specific book by its ID.
    * 
    * @param {Object} req - The request object containing the book ID
    * @param {Object} res - The response object
    * @returns {Promise<void>} Sends a JSON response with the list of comments for the book
    */
    async getCommentByBookId(req, res) {
        try {
            // Get the comment ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Fetch the comment by ID from the comment service
            const comments = await commentService.getCommentByBookId(id);

            // If comment is not found, send a 404 response
            if (!comments) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // If comment is found, respond with the comment data
            res.json(comments);
        } catch (error) {
            // Respond with an internal server error if something goes wrong
            console.error('Error fetching comment:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Creates a new comment for a book.
    * 
    * @param {Object} req - The request object containing the comment data
    * @param {Object} res - The response object
    * @returns {Promise<void>} Sends the updated book details and comments as a response
    */
    async createComment(req, res) {
        try {
            // Get the desc, rating and title from the request body
            const { comment_description, rating, book_id, username } = req.body;

            // Attempt to create a new comment using the comment service
            const newComment = await commentService.createComment({ book_id, comment_description, rating, username });

            // Fetch the updated list of comments for the book
            const comments = await commentService.getCommentByBookId(book_id);
            const book = await bookService.getBookById(book_id);
            const isBorrowed = await bookService.checkIfBookIsBorrowed(
                username,
                book_id
            );
            const password = await userService.getPassword(username);

            // Render the updated book details page with the newly created comment, borrow status, and user information
            res.render('bookInfo', {
                book: book,
                comments: comments,
                username: username,
                isBorrowed: isBorrowed,
                password: password
            });

        } catch (error) {

            // Handle specific error when transaction_id does not exist
            if (error.message.includes('book_id')) {
                return res.status(400).json({ message: error.message });
            }

            // Respond with an internal server error if something goes wrong
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Creates a new comment for a book as an admin.
    * 
    * This function retrieves the necessary details (comment description, rating, book ID, and username) 
    * from the request body and uses the comment service to create a new comment. 
    * Upon success, it sends a notification to the admin and redirects to the comment management page. 
    * If an error occurs, it responds with a corresponding error message.
    * 
    * @param {Object} req - The request object, which contains the comment data in its body.
    * @param {Object} res - The response object, used to send a response back to the client.
    * @returns {Promise<void>} Redirects to the comment management page or sends a relevant error response.
    */
    async createCommentADMIN(req, res) {
        try {
            // Get the desc, rating and title from the request body
            const { comment_description, rating, book_id, username } = req.body;

            // Attempt to create a new comment using the comment service
            const newComment = await commentService.createComment({ book_id, comment_description, rating, username });

            // Show a success notification
            notifier.notify({
                title: 'Comment Management',
                message: `Comment successfully added with the id: ${newComment.comment_id}`,
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Render the updated book details page with the newly created comment, borrow status
            res.redirect('/api/comments/admin')

        } catch (error) {

            // Handle specific error when transaction_id does not exist
            if (error.message.includes('book_id')) {
                return res.status(400).json({ message: error.message });
            }

            // Respond with an internal server error if something goes wrong
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Updates an existing comment by its ID.
    * 
    * @param {Object} req - The request object containing the comment ID and updated data
    * @param {Object} res - The response object
    * @returns {Promise<void>} Sends a success message or error response
    */
    async updateComment(req, res) {
        try {
            // Get the comment ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Get the updated fields from the request body
            const { comment_description, rating } = req.body;

            // Attempt to update the genre using the genre service
            const newComment = await commentService.updateComment(id, { comment_description, rating });

            // Respond with a success message if the comment was updated
            // res.json({ message: 'Comment updated successfully' });

            // Show a success notification
            notifier.notify({
                title: 'Comment Management',
                message: `Comment successfully Updated with the id: ${newComment.comment_id}`,
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            res.redirect('/api/comments');
        } catch (error) {

            // Handle duplicate comment not found
            if (error.message.includes('Comment not found')) {
                return res.status(409).json({ message: 'Comment not found.' });
            } else if (error.message.includes('No changes made')) {
                // Handle if no changes been made to update
                return res.status(404).json({ message: 'No changes made; Comment is already set to this value.' });
            }

            // Respond with an internal server error if something goes wrong
            console.error('Error updating comment:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Deletes a comment by its ID.
    * 
    * @param {Object} req - The request object containing the comment ID
    * @param {Object} res - The response object
    * @returns {Promise<void>} Sends a success message or error response
    */
    async deleteComment(req, res) {
        try {
            // Parse the genre ID
            const id = parseInt(req.params.id, 10);

            // Attempt to delete the genre using the genre service
            const success = await commentService.deleteComment(id);

            // If the comment is not found respond with a 404 or 400 error
            if (!success) {
                return res.status(400).json({ message: 'Comment not found.' });
            }

            // Respond with a success message if the comment was deleted
            // res.json({ message: 'Comment deleted successfully' });

            // Show a success notification
            notifier.notify({
                title: 'Commment Management',
                message: 'Comment deleted successfully',
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the comments list page after deletion
            res.redirect('/api/comments');
        } catch (error) {
            // Handle unexpected errors
            console.error('Error deleting comment:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Renders the form for adding a new comment.
    * 
    * This function fetches all available books and users to populate the form 
    * with a list of books and usernames that can be selected when creating a new comment.
    * The form is rendered with the necessary data to allow the admin to submit a new comment.
    * 
    * @param {Object} req - The request object, which contains information about the request.
    * @param {Object} res - The response object, used to render the form with the necessary data.
    * @returns {Promise<void>} Renders the add comment form with books and usernames data.
    */
    async addForm(req, res) {
        // Fetch all books and users to populate the form
        const book_id = await bookService.getAllBooks(); // Get all books
        const usernames = await userService.getAllUsers(); // Get all users

        // Render the add comment form with the book and username data
        res.render('CommentViews/addComment', { book_id: book_id, usernames: usernames });
    }

    /**
    * Renders the form for editing an existing comment.
    * 
    * This function retrieves the comment ID from the request parameters, 
    * fetches the relevant comment by its ID, and retrieves all available users 
    * to populate the username field in the form. The form is rendered with 
    * the current comment's data and a list of users to select from for editing.
    * 
    * @param {Object} req - The request object, which contains the comment ID in the URL parameters.
    * @param {Object} res - The response object, used to render the form with the existing comment data and usernames.
    * @returns {Promise<void>} Renders the edit comment form with the existing comment's data and a list of usernames.
    */
    async editForm(req, res) {
        const id = parseInt(req.params.id, 10); // Get the comment ID from the URL
        const usernames = await userService.getAllUsers(); // Get all users
        const comment = await commentService.getCommentById(id); // Get the comment by ID
        res.render('CommentViews/editComment', { comment: comment, usernames: usernames }); // Render the page
    }
}

module.exports = new CommentController();
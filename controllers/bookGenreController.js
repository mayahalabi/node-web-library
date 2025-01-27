// Importing the book genre service to handle business logic for book-genre associations
const bookGenreService = require('../services/bookGenreService');

// BookGenreController class manages the CRUD operations for bookgenres
class BookGenreController {

    /**
     * Fetch all book-genre associations.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllBookGenres(req, res) {
        try {
            // Fetch all book-genre associations from the service
            const bookGenre = await bookGenreService.getAllBookGenres();
            res.json(bookGenre); // Return the fetched book-genre data
        } catch (e) {
            console.error('Error fetching information:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }



    /**
     * Fetch book-genre associations by a specific book ID.
     * @param {Object} req - The request object, which contains the book ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookGenreByBookId(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the book ID from the request parameters
            // Fetch the associated book genres from the service
            const book = await bookGenreService.getBookGenreByBookId(id);

            if (!book) {
                return res.status(404).json({ message: 'info not found' }); // Return a 404 if no associations are found
            }
            res.json(book); // Return the associated book-genre data
        } catch (e) {
            console.error('Error fetching info by ID:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch book-genre associations by a specific genre ID.
     * @param {Object} req - The request object, which contains the genre ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookGenreByGenreId(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the genre ID from the request parameters
            // Fetch the associated books for the genre from the service
            const book = await bookGenreService.getBookGenreByGenreId(id);

            if (!book) {
                return res.status(404).json({ message: 'info not found' }); // Return a 404 if no associations are found
            }
            res.json(book); // Return the associated book-genre data
        } catch (e) {
            console.error('Error fetching info by ID:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Create a new book-genre association.
     * @param {Object} req - The request object, containing book and genre IDs in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createBookGenre(req, res) {
        try {
            const { book_Id, genre_Id } = req.body; // Extract book and genre IDs from the request body

            if (!book_Id || !genre_Id) {
                return res.status(400).json({ message: 'Missing information' }); // Return an error if either ID is missing
            }

            // Call the service to create the book-genre association
            const newCon = await bookGenreService.createBookGenre({ book_Id, genre_Id });
            res.status(201).json(newCon); // Return the newly created association
        } catch (e) {
            console.error('Error creating connection:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Update an existing book-genre association.
     * @param {Object} req - The request object, which contains the old association IDs in the URL and new IDs in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async updateBookGenre(req, res) {
        try {
            const { book_Id, genre_Id } = req.params; // Retrieve the old book and genre IDs from the URL
            const { newBookId, newGenreId } = req.body; // Retrieve the new book and genre IDs from the body

            if (!newBookId || !newGenreId) {
                return res.status(400).json({ message: 'Missing book or genre ID' }); // Return an error if new IDs are missing
            }

            // Attempt to update the book-genre association through the service
            const success = await bookGenreService.updateBookGenre(book_Id, genre_Id, newBookId, newGenreId);
            if (!success) {
                return res.status(404).json({ message: 'Book-genre association not found or no changes made' }); // Return a 404 if no update occurs
            }

            res.json({ message: 'Book-genre association updated successfully' }); // Confirm successful update
        } catch (e) {
            console.error('Error updating book-genre association:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Delete a specific book-genre association.
     * @param {Object} req - The request object, which contains the book and genre IDs in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteBookGenre(req, res) {
        try {
            const { book_Id, genre_Id } = req.params; // Extract the book and genre IDs from the request parameters

            // Attempt to delete the book-genre association through the service
            const success = await bookGenreService.deleteBookGenre(book_Id, genre_Id);
            if (!success) {
                return res.status(404).json({ message: 'Book-genre association not found' }); // Return 404 if association is not found
            }

            res.json({ message: 'Book-genre association deleted successfully' }); // Confirm successful deletion
        } catch (e) {
            console.error('Error deleting book-genre association:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }
}

module.exports = new BookGenreController();

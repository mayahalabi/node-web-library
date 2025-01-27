const express = require('express');
const BookGenreController = require('../Controllers/bookGenreController');
const { validateBookGenre, validateBookGenreId } = require('../validators/bookGenreDTO');
const router = express.Router();

// Route to get all book-genre associations
router.get('/', (req, res) => BookGenreController.getAllBookGenres(req, res));

// Route to get all genres for a specific book by book ID
router.get('/book/:id', (req, res) => BookGenreController.getBookGenreByBookId(req, res));

// Route to get all books for a specific genre by genre ID
router.get('/genre/:id', (req, res) => BookGenreController.getBookGenreByGenreId(req, res));

// Route to create a new book-genre association
router.post('/', validateBookGenre, (req, res) => BookGenreController.createBookGenre(req, res));

// Route to update an existing book-genre association
router.put('/:book_Id/:genre_Id', (req, res) => BookGenreController.updateBookGenre(req, res));

// Route to delete a specific book-genre association
router.delete('/:book_Id/:genre_Id', validateBookGenre, (req, res) => BookGenreController.deleteBookGenre(req, res));

module.exports = router;

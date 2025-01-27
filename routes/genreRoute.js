const express = require('express');
const genreController = require('../controllers/genreController');
const { validateGenreId, validateGenre } = require('../validators/genreDTO');

const router = express.Router();

// Define specific routes before parameterized routes 
router.get('/add-form', (req, res) => genreController.addForm(req, res));
router.get('/', (req, res) => genreController.getAllGenres(req, res));
router.post('/create-genre', validateGenre, (req, res) => genreController.createGenre(req, res));
router.post('/update-genre/:id', validateGenreId, (req, res) => genreController.updateGenre(req, res));
router.get('/delete/:id', validateGenreId, (req, res) => genreController.deleteGenre(req, res));
router.get('/edit-form/:id', validateGenreId, (req, res) => genreController.editForm(req, res));
router.get('/:id', validateGenreId, (req, res) => genreController.getGenreById(req, res));

module.exports = router;

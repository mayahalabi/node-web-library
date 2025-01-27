// Import necessary modules
const express = require('express');
const authorController = require('../controllers/authorController');
const { validateAuthorId, validateAuthor } = require('../validators/authorDTO');

const router = express.Router();

// Define routes
router.get('/add-form', (req, res) => authorController.addForm(req, res));
router.get('/', (req, res) => authorController.getAllAuthors(req, res));
router.post('/create-author', validateAuthor, (req, res) => authorController.createAuthor(req, res));
router.post('/update-author/:id', validateAuthorId, validateAuthor, (req, res) => authorController.updateAuthor(req, res));
router.get('/delete/:id', validateAuthorId, (req, res) => authorController.deleteAuthor(req, res));
router.get('/edit-form/:id', validateAuthorId, (req, res) => authorController.editForm(req, res));
router.get('/:id', validateAuthorId, (req, res) => authorController.getAuthorById(req, res));

module.exports = router;

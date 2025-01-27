const express = require('express');
const commentController = require('../controllers/commentController');
const { validateCommentId, createCommentvalidator, updateCommentValidator } = require('../validators/commentDTO');

const router = express.Router();

// Define routes
router.get('/edit-form/:id', (req, res) => commentController.editForm(req, res));
router.get('/add-form', (req, res) => commentController.addForm(req, res));
router.post('/create-comment', (req, res) => commentController.createCommentADMIN(req, res));
router.post('/createComment', (req, res) => commentController.createComment(req, res));
router.get('/admin', (req, res) => commentController.getAllCommentsADMIN(req, res));
router.get('/', (req, res) => commentController.getAllComments(req, res));
router.get('/:id', validateCommentId, (req, res) => commentController.getCommentById(req, res));
router.get('/specific/:id', validateCommentId, (req, res) => commentController.getCommentByBookId(req, res));
router.post('/update-comment/:id', (req, res) => commentController.updateComment(req, res));
router.get('/delete/:id', validateCommentId, (req, res) => commentController.deleteComment(req, res));

module.exports = router;

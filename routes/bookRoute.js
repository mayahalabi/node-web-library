const express = require('express');
const bookController = require("../controllers/bookController");
const { validateBookId, validateBook } = require("../validators/bookDTO");
const { validateUserUsername } = require("../validators/userDTO");
const upload = require('../middlewares/upload');
const multer = require('multer');

const router = express.Router();

// Define routes

// Search route should be placed before other dynamic routes to prevent conflicts
router.get('/searchView', (req, res) => bookController.searchBook(req, res));

// Specific book details routes
router.get("/usersbooks/details/:book_id", (req, res) => bookController.getBookById(req, res));
router.get("/details/:book_id", (req, res) => bookController.detailsForm(req, res));
router.get("/detailsADMIN/:book_id", (req, res) => bookController.detailsFormADMINS(req, res));
router.get("/usersbooks/details/:book_id", (req, res) => bookController.detailsUsersForm(req, res));

// CRUD operations for books
router.get('/edit-form', (req, res) => bookController.editForm(req, res));
router.get("/add-form", (req, res) => bookController.addForm(req, res));
router.get("/", (req, res) => bookController.getAllBooks(req, res));
router.get("/adminManagement", (req, res) => bookController.getAllBooksADMIN(req, res));
router.post('/create-book', upload.single('image_data'), (req, res) => bookController.createBook(req, res));
// router.put("/:id", validateBookId, (req, res) => bookController.updateBook(req, res));
router.get("/delete/:id", (req, res) => bookController.deleteBook(req, res));

// Borrowing and returning books
router.post("/borrowBook", (req, res) => bookController.borrowBook(req, res));
router.post("/returnBook", (req, res) => bookController.returnBook(req, res));

module.exports = router;

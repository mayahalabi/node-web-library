const express = require('express');
const transactionController = require('../controllers/transactionController');
const { validateTransactionId, createTransactionValidator } = require('../validators/transactionDTO');

const router = express.Router();

// Define routes
router.post('/update/:id', (req, res) => transactionController.updateTransaction(req, res));
router.get('/edit-form', (req, res) => transactionController.editForm(req, res));
router.get('/add-form', (req, res) => transactionController.addForm(req, res));
router.get('/byUsernameTransaction/:username', (req, res) => transactionController.getTransactionsByUsername(req, res));
router.get('/', (req, res) => transactionController.getAllTransactions(req, res));
router.get('/:id', validateTransactionId, (req, res) => transactionController.getTransactionById(req, res));
router.post('/create-transaction', (req, res) => transactionController.createTransaction(req, res));
router.get('/delete/:id', validateTransactionId, (req, res) => transactionController.deleteTransaction(req, res));

module.exports = router;

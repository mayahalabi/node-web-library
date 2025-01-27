const express = require('express');
const fineController = require('../controllers/fineController');
const { validateFineId, validateFine } = require('../validators/fineDTO');


const router = express.Router();

// Define routes
router.get('/add-form', (req, res) => fineController.addForm(req, res));
router.get('/', (req, res) => fineController.getAllFines(req, res));
router.get('/:id', validateFineId, (req, res) => fineController.getFineById(req, res));
router.post('/create-fine', (req, res) => fineController.createFine(req, res));
router.post('/update/:id', validateFineId, (req, res) => fineController.updateFine(req, res));
router.get('/delete/:id', validateFineId, (req, res) => fineController.deleteFine(req, res));


module.exports = router;

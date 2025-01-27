const express = require('express');
const userController = require('../controllers/userController');
const { validateUsername, validateUserUsername, validatePassword } = require('../validators/userDTO');

const router = express.Router();

// Define routes
router.get('/index', (req, res) => userController.indexForm(req, res));
router.post('/signup', (req, res) => userController.createUser(req, res));
router.get('/add-form', (req, res) => userController.addForm(req, res));
router.get('/', (req, res) => userController.getAllUsers(req, res));
router.post('/createUser', validateUsername, (req, res) => userController.createUserADMIN(req, res));
router.post('/create-user', validateUsername, (req, res) => userController.createUser(req, res));
router.post('/update-user/:username', validateUserUsername, (req, res) => userController.updateUser(req, res));
router.get('/delete/:username', validateUserUsername, (req, res) => userController.deleteUser(req, res));
router.get('/edit-form/:username', (req, res) => userController.editForm(req, res));
router.get('/:username', validateUserUsername, (req, res) => userController.getUserByUsername(req, res));
router.post('/signin', (req, res) => userController.signIn(req, res));

module.exports = router;

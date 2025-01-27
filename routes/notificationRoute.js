const express = require('express');
const notificationController = require('../controllers/notificationController');
const { validateNotificationId, createNotificationValidator } = require('../validators/notificationDTO');

const router = express.Router();

// Define routes
router.get('/edit-form', (req, res) => notificationController.editForm(req, res));
router.get('/add-form', (req, res) => notificationController.addForm(req, res));
router.get('/byUser/:username', (req, res) => notificationController.getNotificationsByUser(req, res));
router.get('/', (req, res) => notificationController.getAllNotifications(req, res));
router.get('/:id', validateNotificationId, (req, res) => notificationController.getNotificationById(req, res));
router.post('/create-notification', (req, res) => notificationController.createNotification(req, res));
router.get('/delete/:id', validateNotificationId, (req, res) => notificationController.deleteNotification(req, res));

module.exports = router;

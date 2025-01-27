const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const upload = require('../middlewares/upload'); // Multer middleware for file upload

// POST route for uploading images
router.post('/upload', upload.single('image'), imageController.createImage);

// DELETE route for deleting images
router.delete('/delete/:id', imageController.deleteImage);

// GET route for getting all images
router.get('/', (req, res) => imageController.getAllImages(req, res));

module.exports = router;

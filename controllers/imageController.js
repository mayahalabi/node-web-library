// Importing the image service for image-related operations
const imageService = require('../services/imageService');

// ImageController class manages the CRUD operations for images
class ImageController {

    /**
   * Handles image upload requests and stores the image in the database.
   * 
   * @param {Object} req - The request object, which should include the uploaded image file in req.file
   * @param {Object} res - The response object used to send a response to the client
   * @returns {Promise<void>} Responds with a success message or an error message
   */
    async createImage(req, res) {
        try {
            // Check if the image file is provided
            if (!req.file) {
                return res.status(400).json({ message: 'No image file uploaded' });
            }

            // Get image data from Multer's memory storage (req.file is the uploaded file)
            const { buffer, mimetype } = req.file;

            // Check if the buffer exists and is not empty
            if (!buffer) {
                return res.status(400).json({ message: 'Image buffer is empty' });
            }

            // Call the service to upload the image and save it to the database
            const newImage = await imageService.uploadImage(buffer, mimetype);

            // Send back the uploaded image details as response
            res.status(201).json({
                message: 'Image uploaded successfully'
            });

        } catch (error) {
            // Handle unexpected errors and log them
            console.error('Error uploading image:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Handles image deletion requests by image ID.
   * 
   * @param {Object} req - The request object, which should include the image ID in req.params.imageId
   * @param {Object} res - The response object used to send a response to the client
   * @returns {Promise<void>} Responds with a success message or an error message
   */
    async deleteImage(req, res) {
        const { imageId } = req.params;

        try {
            // Call the ImageService to delete the image by its ID
            const result = await imageService.deleteImage(imageId);

            if (result) {
                // Image deleted successfully
                res.json({ message: 'Image deleted successfully' });
            } else {
                // Image not found
                res.status(404).json({ message: 'Image not found' });
            }
        } catch (error) {
            // Handle unexpected errors and log them
            console.error('Error in deleteImage controller:', error);
            res.status(500).json({ message: 'Failed to delete image' });
        }
    }

    /**
   * Retrieves all uploaded images from the database and displays them.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object used to send the response to the client
   * @returns {Promise<void>} Renders a view with a list of all images
   */
    async getAllImages(req, res) {
        try {
            // Call the ImageService to retrieve all images
            const images = await imageService.getAllImages();

            // Render the images page with the list of images
            res.render('ImageViews/images', { images });
        } catch (error) {
            // Log the error and return a failure response
            console.error('Error in getAllImages controller:', error);
            res.status(500).json({ message: 'Failed to retrieve images' });
        }
    }
}

module.exports = new ImageController();

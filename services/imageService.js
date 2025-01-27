// Importing the database initialization function
const { initDB } = require('../config/database');

// Importing the Image model for interacting with image data
const Image = require('../modules/imageModule');

class ImageService {

    // Constructor initializes the database connection pool
    constructor() {
        this.pool = null;    // Database connection pool
        this.init();        //  Initialize database connection
    }

    /**
     * Initializes the database connection pool.
     * This method is called when the ImageService is instantiated.
     */
    async init() {
        // Initialize the database connection pool
        this.pool = await initDB();
    }

    /**
    * Inserts a new image into the database.
    * The image data is converted into a Base64 string before insertion.
    * 
    * @param {Object} imageData - The image data to be inserted.
    * @param {Buffer} imageData.imageBuffer - The binary image data as a Buffer.
    * @param {string} imageData.fileType - The MIME type of the image (e.g., 'image/jpeg').
    * @returns {Promise<number>} - A promise that resolves to the generated image_id of the inserted image.
    * @throws {Error} - Throws an error if the image upload fails.
    */
    async createImage(imageData) {
        const { imageBuffer, fileType } = imageData;
        const query = 'INSERT INTO images (image_data, image_type) VALUES (?, ?)';

        try {
            // Convert image buffer to Base64 format
            const base64Image = imageBuffer.toString('base64');

            // Insert the image data as a Base64 string into the database
            const [result] = await this.pool.query(query, [base64Image, fileType]);

            // Return the inserted image details (including the generated image_id)
            return result.insertId;

        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        }
    }

    /**
    * Deletes an image from the database by its image_id.
    * 
    * @param {number} imageId - The ID of the image to delete.
    * @returns {Promise<boolean>} - A promise that resolves to `true` if the image was deleted, `false` if not.
    * @throws {Error} - Throws an error if the delete operation fails.
    */
    async deleteImage(imageId) {
        const query = 'DELETE FROM images WHERE image_id = ?';

        try {
            // Perform the delete operation
            const [result] = await this.pool.query(query, [imageId]);

            // Check if any row was affected (i.e., image deleted)
            if (result.affectedRows > 0) {
                return true; // Image successfully deleted
            } else {
                return false; // No image found with the given ID
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            throw new Error('Failed to delete image');
        }
    }

    /**
    * Retrieves all images from the database.
    * 
    * @returns {Promise<Array>} - A promise that resolves to an array of Image objects.
    * @throws {Error} - Throws an error if the query fails to fetch images.
    */
    async getAllImages() {
        try {
            // Execute the query to fetch all images
            const [rows] = await this.pool.query('SELECT image_id, image_type, image_data FROM images');

            // Return the results
            return rows.map(Image.fromRow);
        } catch (error) {
            console.error('Error fetching images:', error);
            throw new Error('Failed to fetch images');
        }
    }
}

module.exports = new ImageService();

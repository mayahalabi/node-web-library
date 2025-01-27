/**
 * Represents an Image in the system. 
 * @class 
 */
class Image {

    /**
     * Creates an instance of the Image class.
     * @constructor
     * @param {number} image_id - The unique identifier for the image.
     * @param {Buffer} image_data - The image data stored as a BLOB.
     * @param {string} content_type - The content type of the image (e.g., "image/jpeg").
     */
    constructor(image_id, image_type, image_data) {
        this.image_id = image_id;
        this.image_type = image_type;
        this.image_data = image_data;
    }

    /**
     * Converts a database row to an Image instance.
     * @static
     * @param {Object} row - The database row representing an image.
     * @param {number} row.image_id - The unique identifier for the image.
     * @param {Buffer} row.image_data - The image data stored as a BLOB.
     * @param {string} row.image_type - The content type of the image (e.g., "image/jpeg").
     * @returns {Image} A new instance of the Image class.
     */
    static fromRow(row) {
        return new Image(
            row.image_id,
            row.image_type,
            row.image_data.toString('base64') // Convert binary data to Base64
        );
    }
}

module.exports = Image;

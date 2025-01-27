// Importing the genre service to handle genre-related operations
const genreService = require('../services/genreService');
const notifier = require('node-notifier');
const path = require('path');

// GenreController class manages the CRUD operations for genres
class GenreController {

    /**
   * Retrieves all genres from the genre service.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>} Renders the 'genres' view with the list of genres
   */
    async getAllGenres(req, res) {
        try {
            // Fetch all genres from the genre service
            const genres = await genreService.getAllGenres();

            // Respond with the list of genres
            res.render('GenreViews/genres', { genres });

        } catch (error) {
            // Handle errors and respond with an internal server error
            console.error('Error fetching genres:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Retrieves a specific genre by its ID.
   * 
   * @param {Object} req - The request object containing the genre ID
   * @param {Object} res - The response object
   * @returns {Promise<void>} Responds with the genre data as JSON
   */
    async getGenreById(req, res) {
        try {
            // Get the genre ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Fetch the genre by ID from the genre service
            const genre = await genreService.getGenreById(id);

            // If genre is not found, send a 404 response
            if (!genre) {
                return res.status(404).json({ message: 'Genre not found' });
            }

            // If genre is found, respond with the genre data
            res.json(genre);

        } catch (error) {
            // Respond with an internal server error if something goes wrong
            console.error('Error fetching genre:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Creates a new genre.
   * 
   * @param {Object} req - The request object containing the genre data
   * @param {Object} res - The response object
   * @returns {Promise<void>} Redirects to the genres list page after creating the genre
   */
    async createGenre(req, res) {
        try {
            // Get the genre type from the request body
            const { type } = req.body;

            // Check if the type is provided, otherwise send a 400 error
            if (!type) {
                return res.status(400).json({ message: 'Type is required' });
            }

            // Attempt to create a new genre using the genre service
            const newGenre = await genreService.createGenre({ type });

            // Send desktop notification
            notifier.notify({
                title: 'Genre Management',
                message: `Genre successfully added with the id: ${newGenre.genre_id}`,
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the genres list page
            return res.redirect('/api/genres');

        } catch (error) {
            let errorMessage = 'Internal server error';

            // Handle duplicate genre type error
            if (error.message.includes('already exists')) {
                errorMessage = 'Genre type already exists.';

                // Send desktop notification
                notifier.notify({
                    title: 'Genre Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the genres list page
                return res.redirect('/api/genres');
            }

            // Log unexpected errors and send a response
            console.error('Error fetching genre:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Updates an existing genre by its ID.
   * 
   * @param {Object} req - The request object containing the genre ID and updated data
   * @param {Object} res - The response object
   * @returns {Promise<void>} Redirects to the genres list page after updating the genre
   */
    async updateGenre(req, res) {
        try {
            // Get the genre ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Get the new type from the request body
            const { type } = req.body;

            // Attempt to update the genre using the genre service
            const updatedGenre = await genreService.updateGenre(id, { type });

            // Send desktop notification
            notifier.notify({
                title: 'Genre Management',
                message: `Genre ${updatedGenre.genre_id} updated successfully`,
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the genres list page
            res.redirect('/api/genres');

        } catch (error) {

            let errorMessage = 'Internal server error';

            // Handle duplicate genre type error
            if (error.message.includes('already exists')) {
                errorMessage = 'Genre already exists.';

                // Send desktop notification
                notifier.notify({
                    title: 'Genre Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                return res.redirect('/api/genres');
            } else if (error.message.includes('Genre not found')) {
                // Handle genre not found error
                errorMessage = 'Genre not found.';

                // Send desktop notification
                notifier.notify({
                    title: 'Genre Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                return res.redirect('/api/genres');
            } else if (error.message.includes('No changes made')) {
                // Handle the case where no changes were made
                errorMessage = 'No changes made; type is already set to this value';

                // Send desktop notification
                notifier.notify({
                    title: 'Genre Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the genres list page
                return res.redirect('/api/genres');
            }

            // Handle unexpected errors
            console.error('Error updating genre:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Deletes a genre by its ID.
   * 
   * @param {Object} req - The request object containing the genre ID
   * @param {Object} res - The response object
   * @returns {Promise<void>} Redirects to the genres list page after deleting the genre
   */
    async deleteGenre(req, res) {
        try {
            // Extract the genre ID from request parameters
            const id = parseInt(req.params.id, 10);

            // Attempt to delete the genre using the genre service
            await genreService.deleteGenre(id);

            // Send desktop notification
            notifier.notify({
                title: 'Genre Management',
                message: 'Genre deleted successfully',
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the genres list page
            res.redirect('/api/genres');

        } catch (error) {
            let errorMessage = 'Internal server error';

            if (error.message.includes('Genre not found')) {
                // Genre not found, set error flash message
                errorMessage = 'Genre not found';

                // Send desktop notification
                notifier.notify({
                    title: 'Genre Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the genres list page
                return res.redirect('/api/genres');
            }

            if (error.message.includes('associated with existing books')) {
                // Genre is associated with existing books, set error message
                errorMessage = 'Genre cannot be deleted as it is associated with existing books.';

                // Send desktop notification
                notifier.notify({
                    title: 'Genre Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the genres list page
                return res.redirect('/api/genres');
            }

            // Handle unexpected errors
            console.error('Error deleting genre:', error);

            // Send desktop notification
            notifier.notify({
                title: 'Genre Management',
                message: errorMessage,
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the genres list page
            return res.redirect('/api/genres');
        }
    }

    /**
   * Renders the edit form for a specific genre.
   * 
   * @param {Object} req - The request object containing the genre ID
   * @param {Object} res - The response object
   * @returns {Promise<void>} Renders the edit genre page with the genre data
   */
    async editForm(req, res) {
        try {
            // Extract the genre ID from request parameters
            const id = parseInt(req.params.id, 10);

            // Fetch the genre by ID
            const genre = await genreService.getGenreById(id);

            // Render the edit genre form with the genre data
            res.render('GenreViews/editGenre', { genre: genre });

        } catch (error) {
            // Handle errors and respond with an internal server error
            console.error('Error deleting genre:', error);
            res.status(500).json({ message: 'Internal Service error' });
        }
    }

    /**
   * Renders the add genre form.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>} Renders the add genre page
   */
    async addForm(req, res) {
        // Render the add genre form
        res.render('GenreViews/addGenre');
    }
}

module.exports = new GenreController();
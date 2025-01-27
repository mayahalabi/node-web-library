const authorService = require('../services/authorService'); // Importing author service for database interactions
const notifier = require('node-notifier'); // Importing node-notifier for desktop notifications
const path = require('path'); // Path module to resolve file paths for notification icons

// AuthorController class manages the CRUD operations for authors
class AuthorController {

    /**
    * Fetches all authors from the author service and renders the authors page.
    * 
    * @param {Object} req - The request object, containing any necessary parameters (e.g., filters).
    * @param {Object} res - The response object, used to render the 'authors' page with the authors data.
    * 
    * @returns {Promise<void>} Renders the 'authors' page with the fetched authors.
    */
    async getAllAuthors(req, res) {
        try {
            // Fetch all authors from the author service
            const authors = await authorService.getAllAuthors();

            // Render the authors page with the fetched authors
            res.render('AuthorViews/authors', { authors });

        } catch (error) {
            // Log error and send an internal server error response if something goes wrong
            console.error('Error fetching authors:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Fetches a specific author by ID.
    * 
    * @param {Object} req - The request object containing the author's ID in the URL.
    * @param {Object} res - The response object, used to return the author data in JSON format.
    * 
    * @returns {Promise<void>} Responds with the author data or a 404 error if not found.
    */
    async getAuthorById(req, res) {
        try {
            // Parse the author ID from the URL parameter
            const id = parseInt(req.params.id, 10);

            // Fetch the author by ID from the service
            const author = await authorService.getAuthorById(id);

            // If author is not found, respond with a 404
            if (!author) {
                return res.status(404).json({ message: 'Author not found' });
            }

            // Respond with the found author
            res.json(author);

        } catch (error) {
            // Log error and respond with a 500 error if something goes wrong
            console.error('Error fetching author:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Creates a new author with the provided first name and last name.
    * 
    * @param {Object} req - The request object containing the first name and last name in the body.
    * @param {Object} res - The response object, used to redirect to the authors page after creation.
    * 
    * @returns {Promise<void>} Redirects to the authors list page after successful creation.
    */
    async createAuthor(req, res) {
        try {
            // Extract first name and last name from the request body
            const { first_name, last_name } = req.body;

            // Attempt to create a new author
            const newAuthor = await authorService.createAuthor({ first_name, last_name });

            // Show a success notification
            notifier.notify({
                title: 'Author Management',
                message: `Author successfully added with the id: ${newAuthor.author_id}`,
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the authors list page after creation
            return res.redirect('/api/authors');

        } catch (error) {
            let errorMessage = 'Internal server error';

            // Handle case where the author already exists
            if (error.message.includes('already exists')) {
                errorMessage = 'Author already exists.';

                // Notify the user about the error
                notifier.notify({
                    title: 'Author Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the authors page
                return res.redirect('/api/authors');
            }

            // Log error and send a 500 server error response if something unexpected goes wrong
            console.error('Error creating author:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Updates an existing author's details using the provided first name and last name.
    * 
    * @param {Object} req - The request object containing the author's ID in the URL and updated details in the body.
    * @param {Object} res - The response object, used to redirect to the authors page after updating.
    * 
    * @returns {Promise<void>} Redirects to the authors list page after successful update.
    */
    async updateAuthor(req, res) {
        try {
            // Get the author ID from the URL parameters
            const id = parseInt(req.params.id, 10);

            // Get updated first name and last name from the request body
            const { first_name, last_name } = req.body;

            // Attempt to update the author via the author service
            await authorService.updateAuthor(id, { first_name, last_name });

            // Show a success notification
            notifier.notify({
                title: 'Author Management',
                message: 'Author updated successfully',
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the authors list page after updating
            return res.redirect('/api/authors');

        } catch (error) {
            let errorMessage = 'Internal server error';

            // Handle specific error messages (e.g., author not found, already exists)
            if (error.message.includes('Author not found')) {
                errorMessage = 'Author not found.';
            } else if (error.message.includes('already exists')) {
                errorMessage = 'Author already exists.';
            } else if (error.message.includes('No changes made')) {
                errorMessage = 'No changes made; author is already set to this value.';
            }

            // Show a notification with the appropriate error message
            notifier.notify({
                title: 'Author Management',
                message: errorMessage,
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the authors page after error
            return res.redirect('/api/authors');
        }
    }

    /**
    * Deletes an author from the system using the author's ID.
    * 
    * @param {Object} req - The request object containing the author's ID in the URL.
    * @param {Object} res - The response object, used to redirect to the authors page after deletion.
    * 
    * @returns {Promise<void>} Redirects to the authors list page after successful deletion.
    */
    async deleteAuthor(req, res) {
        try {
            // Parse the author ID from the URL
            const id = parseInt(req.params.id, 10);

            // Attempt to delete the author via the service
            await authorService.deleteAuthor(id);

            // Show a success notification
            notifier.notify({
                title: 'Author Management',
                message: 'Author deleted successfully',
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the authors list page after deletion
            res.redirect('/api/authors');

        } catch (error) {
            let errorMessage = 'Internal server error';

            // Handle specific errors (e.g., author not found, author associated with books)
            if (error.message.includes('Author not found')) {
                errorMessage = 'Author not found';

                // Notify the user about the error
                notifier.notify({
                    title: 'Author Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the authors page after error
                return res.redirect('/api/authors');
            }

            // Handle author cannot be deleted due to associations with books
            if (error.message.includes('associated with existing books')) {
                errorMessage = 'Author cannot be deleted as it is associated with existing books.';

                // Notify the user about the error
                notifier.notify({
                    title: 'Author Management',
                    message: errorMessage,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the authors page after error
                return res.redirect('/api/authors');
            }

            // Handle unexpected errors
            console.error('Error deleting author:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Renders the form to edit an existing author's details.
     * 
     * This method fetches the author data by ID, then renders the `editAuthor` view
     * that contains a form pre-populated with the author's existing details.
     * 
     * @param {Object} req - The request object, containing the author's ID in the URL.
     * @param {Object} res - The response object used to render the form view.
     * 
     * @returns {Promise<void>} Renders the 'editAuthor' form view with the author details.
     */
    async editForm(req, res) {
        try {
            // Get the author ID from the URL parameters
            const id = parseInt(req.params.id, 10);

            // Fetch the author data by ID
            const author = await authorService.getAuthorById(id);

            // Render the 'editAuthor' form view, passing the fetched author data
            res.render('AuthorViews/editAuthor', { author: author });

        } catch (error) {
            // Log error if fetching author data or rendering the form fails
            console.error('Error deleting author:', error);
            res.status(500).json({ message: 'Internal Service error' });
        }
    }

    /**
     * Renders the form to add a new author.
     * 
     * This method renders the `addAuthor` view that contains a form for adding a new author.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object used to render the form view.
     * 
     * @returns {Promise<void>} Renders the `addAuthor` form view.
     */
    async addForm(req, res) {
        try {
            // Render the 'addAuthor' view to display the form for adding a new author
            res.render('AuthorViews/addAuthor');
        } catch (error) {
            // Log error if rendering the form fails
            console.error('Error rendering add author form:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new AuthorController();
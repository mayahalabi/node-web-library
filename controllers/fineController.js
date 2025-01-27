// Importing the fine service to handle fine-related operations
const fineService = require('../services/fineService');
const transactionService = require('../services/transactionService');
const notifier = require('node-notifier'); // Importing node-notifier for desktop notifications
const path = require('path'); // Path module to resolve file paths for notification icons


class FineController {

    /**
    * Retrieves and renders all fines in the system.
    * 
    * This method fetches all fines from the `fineService` and renders the `fines` view
    * with the list of fines. If an error occurs while fetching the fines, a 500 
    * internal server error is returned.
    * 
    * @param {Object} req - The request object, which contains information about the incoming request.
    * @param {Object} res - The response object, used to render the `fines` page with the retrieved fines.
    * @returns {Promise<void>} Renders the fines list page with all the fines.
    */
    async getAllFines(req, res) {
        try {
            // Fetch all fines from the service
            const fines = await fineService.getAllFines();

            // Render the fines page with the retrieved fines
            res.render('FineViews/fines', { fines: fines });

        } catch (error) {
            // Handle errors during fetching fines
            console.error('Error fetching fines:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Retrieves and returns a fine by its ID.
    * 
    * This method fetches a fine by its `fine_id` from the URL parameters. If the fine is
    * not found, a 404 error is returned. If an error occurs, a 500 internal server error
    * is returned.
    * 
    * @param {Object} req - The request object, containing the `fine_id` in the URL parameters.
    * @param {Object} res - The response object, used to return the fine or error message.
    * @returns {Promise<void>} Returns the fine as a JSON object or a 404 error if not found.
    */
    async getFineById(req, res) {
        try {

            // Extract fine_id from the URL parameter
            const id = parseInt(req.params.id, 10);

            // Fetch the fine by ID from the service
            const fine = await fineService.getFineById(id);

            // If fine is not found, return a 404 error
            if (!fine) {
                return res.status(404).json({ message: 'Fine not found' });
            }

            // Return the fine object if found
            res.json(fine);

        } catch (error) {
            // Handle errors during fetching the fine
            console.error('Error fetching fine:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Creates a new fine based on the provided transaction ID.
    * 
    * This method extracts the `transaction_id` from the request body, checks if it's
    * provided, and calls the `fineService.createFine()` method to create the fine. A
    * success notification is displayed upon successful creation. Afterward, the user is
    * redirected to the fines list page.
    * 
    * @param {Object} req - The request object containing the `transaction_id` in the body.
    * @param {Object} res - The response object used to send a redirect response after fine creation.
    * @returns {Promise<void>} Redirects to the fines list page after creating the fine.
    */
    async createFine(req, res) {
        try {
            // Extract transaction_id from the request body
            const { transaction_id } = req.body;

            // Check if transaction_id is provided
            if (!transaction_id) {
                return res.status(400).json({ message: 'TransactionID is required' });
            }

            // Create a new fine using the service
            const newFine = await fineService.createFine({ transaction_id });

            // Show a success notification
            notifier.notify({
                title: 'Fine Management',
                message: `Fine successfully added with the id: ${newFine.fine_id}`,
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the fines list page after creation
            return res.redirect('/api/fines');
        } catch (error) {

            // Handle specific error when transaction_id does not exist
            if (error.message.includes('does not exist')) {
                return res.status(400).json({ message: error.message });
            }

            // Catch other errors
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Updates a fine's status to "paid" based on the provided fine ID.
    * 
    * This method extracts the `fine_id` from the URL parameter and updates the fine
    * status using `fineService.updateFine()`. A success notification is displayed upon
    * successful update. The user is then redirected to the fines list page.
    * 
    * @param {Object} req - The request object containing the `fine_id` in the URL parameter.
    * @param {Object} res - The response object used to return success and redirect after the update.
    * @returns {Promise<void>} Redirects to the fines list page after the update.
    */
    async updateFine(req, res) {
        try {
            // Extract fine_id from the URL parameter
            const fine_id = parseInt(req.params.id, 10);

            // Check if fine_id is valid
            if (!fine_id) {
                return res.status(400).json({ message: 'Fine ID is required' });
            }

            // Call the service to update the fine and retrieve the updated details
            const updatedFine = await fineService.updateFine(fine_id);

            // Show a success notification
            notifier.notify({
                title: 'Fine Management',
                message: 'Fine updated successfully',
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the fines list page after updating
            return res.redirect('/api/fines');

        } catch (error) {

            // Handle errors during fine update
            if (error.message.includes('Fine not found')) {
                return res.status(409).json({ message: 'Fine not found.' });
            } else if (error.message.includes('Check was paid')) {
                // Show a success notification
                notifier.notify({
                    title: 'Fine Management',
                    message: 'Check was paid.',
                    icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the fines list page after updating
                return res.redirect('/api/fines');
            }

            // Handle general errors
            console.error('Error updating fine:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Deletes a fine based on the provided fine ID.
    * 
    * This method extracts the `fine_id` from the URL parameter and calls the
    * `fineService.deleteFine()` method to delete the fine. A success notification is
    * shown after successful deletion, and the user is redirected to the fines list page.
    * 
    * @param {Object} req - The request object containing the `fine_id` in the URL parameter.
    * @param {Object} res - The response object used to send a redirect response after fine deletion.
    * @returns {Promise<void>} Redirects to the fines list page after deleting the fine.
    */
    async deleteFine(req, res) {
        try {
            // Extract fine_id from the URL parameter
            const id = parseInt(req.params.id, 10);

            // Call the service to delete the fine
            const success = await fineService.deleteFine(id);

            // Show a success notification
            notifier.notify({
                title: 'Fine Management',
                message: 'Fine deleted successfully',
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the fines list page after deletion
            res.redirect('/api/fines');

        } catch (error) {
            // Handle errors during fine deletion
            console.error('Error deleting fine:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * Renders the form to add a new fine.
    * 
    * This method fetches all transactions from the `transactionService` and renders
    * the `addFine` view with the list of transactions. This allows the user to select
    * a transaction when creating a new fine.
    * 
    * @param {Object} req - The request object, used to handle incoming HTTP requests.
    * @param {Object} res - The response object, used to render the `addFine` form.
    * @returns {Promise<void>} Renders the `addFine` form with all available transactions.
    */
    async addForm(req, res) {
        // Fetch all transactions from the transaction service
        const transactions = await transactionService.getAllTransactions();

        // Render the `addFine` view, passing the list of transactions
        res.render('FineViews/addFine', { transactions: transactions });
    }
}

module.exports = new FineController();
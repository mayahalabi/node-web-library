// Importing required services and modules for transaction-related operations
const transactionService = require('../services/transactionService');
const usernameSerive = require('../services/userService');
const bookService = require('../services/bookService');
const userService = require('../services/userService');
const notifier = require('node-notifier');
const path = require('path');

// TransactionController class manages the CRUD operations for transactions
class TransactionController {

    /**
     * Fetches all transactions and renders them in the 'transactions' view.
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllTransactions(req, res) {
        try {
            // Fetch all transactions from the transaction service
            const transaction = await transactionService.getAllTransactions();

            // Render the 'transactions' view with the list of transactions
            // The transactions are passed as context to the view
            res.render('TransactionViews/transactions', { transactions: transaction });

        } catch (error) {
            // Respond with an internal server error if something goes wrong
            console.error('Error fetching borrowing transactions:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Fetches a transaction by its ID.
     * 
     * @param {Object} req - Express request object (contains the transaction ID)
     * @param {Object} res - Express response object
     */
    async getTransactionById(req, res) {
        try {
            // Get the transaction ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Fetch the transaction by ID from the transaction service
            const transaction = await transactionService.getTransactionById(id);

            // If transaction is not found, send a 404 response
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            // If transaction is found, respond with the transaction data
            res.json(transaction);

        } catch (error) {
            // Respond with an internal server error if something goes wrong
            console.error('Error fetching transaction:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Fetches transactions for a specific user based on their username.
     * 
     * @param {Object} req - Express request object (contains the username)
     * @param {Object} res - Express response object
     */
    async getTransactionsByUsername(req, res) {
        try {
            // Extract username from request parameters
            const username = req.params.username;

            // Fetch transactions related to the username
            const transactions = await transactionService.getTransactionsByUsername(username);

            // Render the 'borrowedBooksByUser' view with the fetched transactions
            res.render('borrowedBooksByUser', { transactions: transactions });

        } catch (error) {
            // Respond with an internal server error if something goes wrong
            console.error('Error fetching transactions:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Creates a new transaction for a user borrowing a book.
     * 
     * @param {Object} req - Express request object (contains username and book_id)
     * @param {Object} res - Express response object
     */
    async createTransaction(req, res) {
        try {
            // Destructure the username and book_id from the request body
            const { username, book_id } = req.body;

            // Call the transaction service to create a new transaction
            const newTransaction = await transactionService.createTransaction({ username, book_id });

            // Send a desktop notification upon successful transaction creation
            notifier.notify({
                title: 'Transaction Management',
                message: "Transaction created successfully",
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // After creating the transaction, redirect to the transactions list
            return res.redirect('/api/transactions');

        } catch (error) {
            // Log the error for debugging purposes
            console.error('Error creating transaction:', error);

            // Handle specific errors and send desktop notifications accordingly
            if (error.message && error.message.includes('does not exist in the book')) {

                // If the book doesn't exist, send an error notification
                notifier.notify({
                    title: 'Transaction Management',
                    message: error.message,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect back to the transactions page
                return res.redirect('/api/transactions');
            }

            // Handle user-related errors
            if (error.message && error.message.includes('does not exist in the user')) {

                // return res.status(400).json({ message: error.message }); // User not available
                notifier.notify({
                    title: 'Transaction Management',
                    message: error.message,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect back to the transactions page
                return res.redirect('/api/transactions');
            }

            // Handle specific errors with custom messages
            if (error.message && error.message.includes('No available copies')) {

                // send an error notification
                notifier.notify({
                    title: 'Transaction Management',
                    message: error.message,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect back to the transactions page
                return res.redirect('/api/transactions');
            }

            // Handle specific errors with custom messages
            if (error.message && error.message.includes('has already borrowed')) {

                // send an error notification
                notifier.notify({
                    title: 'Transaction Management',
                    message: error.message,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect back to the transactions page
                return res.redirect('/api/transactions');
            }

            // For other errors internal server errors, send a generic 500 message
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Updates an existing transaction.
     * 
     * @param {Object} req - Express request object (contains the transaction ID)
     * @param {Object} res - Express response object
     */
    async updateTransaction(req, res) {
        try {
            // Get the transaction id from the request parameters
            const { id } = req.params;

            // Call the service to update the transaction
            const result = await transactionService.updateTransaction({ id });

            // If the transaction was successfully updated
            const usernames = await userService.getAllUsers();
            const book_id = await bookService.getAllBooks();
            const transactions = await transactionService.getAllTransactions();

            // Send success notification
            notifier.notify({
                title: 'Transaction Management',
                message: 'Transaction successfully updated!',
                icon: path.join(__dirname, 'path/to/success-icon.png'),
                sound: true,
            });

            // Render updated transactions page or redirect to the list
            return res.render('TransactionViews/transactions', {
                usernames: usernames,
                book_id: book_id,
                transactions: transactions
            });

        } catch (error) {
            console.error('Error updating transaction:', error);

            // Handle specific error message based on the exception thrown in the service
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            if (error.message.includes('completed')) {

                // Notify user if the book has already been returned (or similar business logic)
                notifier.notify({
                    title: 'Transaction Management',
                    message: 'Book already returned, unable to update transaction.',
                    icon: path.join(__dirname, 'path/to/error-icon.png'),
                    sound: true,
                });

                // Render transactions page with current data
                const usernames = await userService.getAllUsers();
                const book_id = await bookService.getAllBooks();
                const transactions = await transactionService.getAllTransactions();

                // Ensure only one response is sent
                return res.render('TransactionViews/transactions', {
                    usernames: usernames,
                    book_id: book_id,
                    transactions: transactions
                });
            }

            // Catch all other errors
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Deletes an existing transaction.
     * 
     * @param {Object} req - Express request object (contains the transaction ID)
     * @param {Object} res - Express response object
     */
    async deleteTransaction(req, res) {
        try {
            // Get the transaction ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Attempt to update the transaction using the genre service
            const success = await transactionService.deleteTransaction(id);

            // If successful, send a success message
            notifier.notify({
                title: 'Transaction Management',
                message: "Transaction deleted successfully",
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect back to the transactions page
            return res.redirect('/api/transactions');

        } catch (error) {
            // Error response for other errors
            console.error('Error deleting borrowing transaction:', error);

            // Send desktop notification
            notifier.notify({
                title: 'Transaction Management',
                message: 'Internal server error',
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect back to the transactions page
            return res.redirect('/api/transactions');
        }
    }

    /**
    * Renders the form to add a new transaction.
    * 
    * @param {Object} req - Express request object
    * @param {Object} res - Express response object
    */
    async addForm(req, res) {
        // Fetch the list of all users from the user service
        const usernames = await userService.getAllUsers();

        // Fetch the list of all books from the book service
        const book_id = await bookService.getAllBooks();

        // Render the 'addTransaction' view and pass the fetched data
        // The 'usernames' are used for selecting users, and 'book_id' is used for selecting books
        res.render('TransactionViews/addTransaction', { usernames: usernames, book_id: book_id });
    }
}

module.exports = new TransactionController();
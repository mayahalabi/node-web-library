// Importing required services and modules for transaction-related operations
const { Result } = require('express-validator');
const userService = require('../services/userService');
const notifier = require('node-notifier');
const path = require('path');
const bookService = require('../services/bookService');

// UserController class manages the CRUD operations for users
class UserController {

    /**
     * Fetches all users and renders the users view.
     * 
     * This method retrieves the list of all users from the user service
     * and passes the data to the `users` view to be displayed.
     * If an error occurs, it responds with a 500 status code.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    async getAllUsers(req, res) {
        try {
            // Fetch all users from the user service
            const users = await userService.getAllUsers();

            // Render the 'users' view with the list of users
            res.render('UserViews/users', { users });

        } catch (error) {
            // Log error and send an internal server error response if something goes wrong
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Fetches a user by their username.
     * 
     * This method retrieves a user by their username from the user service.
     * If the user is not found, it responds with a 404 status code.
     *
     * @param {Object} req - The request object, containing the username as a URL parameter.
     * @param {Object} res - The response object.
     */
    async getUserByUsername(req, res) {
        try {
            // Get the username from the request parameters
            const username = req.params.username;

            // Fetch user by username
            const user = await userService.getUserByUsername(username);

            // If the user is not found, return a 404 error
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Return the user details as a JSON response
            res.json(user);

        } catch (error) {
            // Log error and send an internal server error response if something goes wrong
            console.error('Error fetching user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Creates a new user in the system.
     * 
     * This method receives the user data from the request body, calls the user service to create the user,
     * and sends a notification on success. If the user is created successfully, the user is redirected to
     * the homepage or users list based on their role.
     * 
     * If an error occurs (e.g., username conflict), it handles the error accordingly.
     *
     * @param {Object} req - The request object containing the user data in the body.
     * @param {Object} res - The response object.
     */
    async createUser(req, res) {
        try {
            // Get user data from the request body
            const userData = req.body;

            // Create the user
            const newUser = await userService.createUser(userData);

            // If the role is 'user', notify the user and redirect to homepage
            if (userData.role === 'user') {
                notifier.notify({
                    title: 'welcome now sign in',
                    message: `User ${newUser.username} created successfully`,
                });

                // Redirect to homepage
                res.redirect('/')
            }
            else {
                // For 'admin' role, notify and redirect to the users list
                notifier.notify({
                    title: 'User Management',
                    message: `User ${newUser.username} created successfully`,
                    icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the users list page
                res.redirect('/api/users');
            }

        } catch (err) {
            // Handle the case where the username already exists
            if (err.message === 'Username already exists') {
                notifier.notify({
                    title: 'User Management',
                    message: 'Username already exists',
                    icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the users list page
                res.redirect('/api/users');

            }

            // Handle any other errors
            console.error(err);
            res.status(500).json({ error: 'An error occurred while creating the user' });
        }
    }

    /**
     * Updates the information of an existing user.
     * 
     * This method updates the user details (e.g., first name, last name, email, etc.) based on the username.
     * If the user is not found or no changes were made, it notifies the user and redirects back to the users list.
     * On success, it sends a notification and redirects to the users list.
     *
     * @param {Object} req - The request object containing the username as a URL parameter and user data in the body.
     * @param {Object} res - The response object.
     */
    async updateUser(req, res) {
        try {
            // Get the username from the request parameters
            const username = req.params.username;

            // Get updated user data
            const { first_name, last_name, email,
                phoneNumber, address, role, password } = req.body;

            // Update the user
            const success = await userService.updateUser(username, {
                first_name, last_name, email,
                phoneNumber, address, role, password
            });

            // If no user is found or no changes are made, send a notification
            if (!success) {
                notifier.notify({
                    title: 'User Management',
                    message: 'User not found or no changes made',
                    icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the users list page
                res.redirect('/api/users');
            }

            // notify for successfull update
            notifier.notify({
                title: 'User Management',
                message: `User ${username} updated successfully`,
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the users list page
            res.redirect('/api/users');

        } catch (error) {
            // Log error and send an internal server error response if something goes wrong
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Deletes a user by their username.
     * 
     * This method deletes the user identified by their username from the database.
     * If successful, it sends a notification and redirects to the users list.
     * If the user is not found, it responds with a notification and redirects to the list.
     *
     * @param {Object} req - The request object containing the username as a URL parameter.
     * @param {Object} res - The response object.
     */
    async deleteUser(req, res) {
        try {
            // Get the username from the request parameters
            const username = req.params.username;

            // Delete the user
            const success = await userService.deleteUser(username);

            // If the user is not found, send a notification
            if (!success) {
                // nnotify for failure
                notifier.notify({
                    title: 'User Management',
                    message: 'User not found',
                    icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the users list page
                res.redirect('/api/users');
            }

            // notify for successfull deletion
            notifier.notify({
                title: 'User Management',
                message: `User ${username} deleted successfully`,
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the users list page
            res.redirect('/api/users');

        } catch (error) {
            // Log error and send an internal server error response if something goes wrong
            console.error('Error deleting user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Handles user sign-in.
     * 
     * This method validates the user's username and password. If the credentials are valid, 
     * it renders the appropriate page based on the user's role (user or admin).
     * If the sign-in fails, it redirects to the homepage with an error message.
     *
     * @param {Object} req - The request object containing the username and password.
     * @param {Object} res - The response object.
     */
    async signIn(req, res) {
        try {
            // Get username and password from request body
            const { username, password } = req.body;

            // Validate username and password using the signIn service
            const result = await userService.signIn({ username, password });

            // If sign-in fails, redirect to homepage with an error message
            if (!result.success) {
                // Redirect to homepage with an error message in the query parameter
                return res.redirect('/?error=Invalid username or password');
            }

            // Fetch all books from the book service
            const books = await bookService.getAllBooks();

            // If sign-in is successful, pass the role and username to the appropriate page
            // Redirect based on the user's role
            if (result.role === 'user') {
                // For a regular user, pass username and books
                return res.render('books', {
                    username: result.username,
                    books: books,
                    role: result.role
                });
            }

            // If the user is an admin, render the admin dashboard
            if (result.role === 'admin') {
                // For an admin, pass username, books, and role
                return res.render('index', {
                    username: result.username,
                    books: books,
                    role: result.role
                });
            }

        } catch (e) {
            // Log error and send an internal server error response if something goes wrong
            console.error('Error during sign-in:', e);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Renders the form to edit an existing user's information.
     * 
     * This method retrieves the user details based on their username and renders the `editUser` view
     * for the admin to update the user's information.
     *
     * @param {Object} req - The request object containing the username as a URL parameter.
     * @param {Object} res - The response object.
     */
    async editForm(req, res) {
        try {
            // Get the username from the request parameters
            const username = req.params.username;

            // Fetch the user by username
            const user = await userService.getUserByUsername(username);

            // Render the 'editUser' form view with the user data
            res.render('UserViews/editUser', { user: user });

        } catch (error) {
            // Log error and send an internal server error response if something goes wrong
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Internal Service error' });
        }
    }

    /**
     * Renders the form to add a new user.
     * 
     * This method simply renders the `addUser` form view for creating a new user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    async addForm(req, res) {
        // Render the 'addUser' form view
        res.render('UserViews/addUser');
    }

    /**
     * Renders the homepage or landing page.
     * 
     * This method simply renders the homepage view (`index`).
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    async indexForm(req, res) {
        // Render the 'index' homepage view
        res.render('index');
    }

    /**
    * Creates a new user with the specified data and handles the process of 
    * notifying the admin and redirecting them to the users list.
    * 
    * @param {Object} req - The request object containing the user's data.
    * @param {Object} res - The response object used to send the response.
    * 
    * @throws {Error} If the user creation fails (e.g., username already exists or database error).
    */
    async createUserADMIN(req, res) {
        try {
            // Get user data from the request body
            const userData = req.body;

            // Create the user
            const newUser = await userService.createUser(userData);

            // For 'admin' role, notify and redirect to the users list
            notifier.notify({
                title: 'User Management',
                message: `User ${newUser.username} created successfully`,
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the users list page
            res.redirect('/api/users');
        } catch (err) {
            // Handle the case where the username already exists
            if (err.message === 'Username already exists') {
                notifier.notify({
                    title: 'User Management',
                    message: 'Username already exists',
                    icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the users list page
                res.redirect('/api/users');

            }

            // Handle any other errors
            console.error(err);
            res.status(500).json({ error: 'An error occurred while creating the user' });
        }
    }
}

module.exports = new UserController();
// Importing services for notifications, users, and books
const notificationService = require('../services/notificationService');
const userService = require('../services/userService');
const bookService = require('../services/bookService');
const notifier = require('node-notifier');
const path = require('path');

// NotificationController class manages the CRUD operations for notifications
class NotificationController {

    /**
   * Fetches and displays all notifications.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object used to send a response
   * @returns {Promise<void>} Renders the notifications page with a list of all notifications
   */
    async getAllNotifications(req, res) {
        try {
            // Fetch all notifications from the notification service
            const notifications = await notificationService.getAllNotifications();

            // Render the notifications view with the retrieved notifications
            res.render('NotificationViews/notifications', { notifications: notifications });

        } catch (error) {
            // Log error and send a response indicating internal server error
            console.error('Error fetching notifications:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Fetches and displays notifications for a specific user.
   * 
   * @param {Object} req - The request object, including username in the URL params
   * @param {Object} res - The response object used to send a response
   * @returns {Promise<void>} Renders the notifications page for the user
   */
    async getNotificationsByUser(req, res) {
        try {
            // Extract the username from the request parameters
            const username = req.params.username;

            // Fetch notifications specific to the user
            const notifications = await notificationService.getNotificationsByUser(username);

            // Render the notifications view for the specific user
            res.render('notificationsForUser', { notifications: notifications });

        } catch (error) {
            // Log error and send a response indicating internal server error
            console.error('Error fetching notifications:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Fetches a specific notification by its ID.
   * 
   * @param {Object} req - The request object, including the notification ID in the URL params
   * @param {Object} res - The response object used to send a response
   * @returns {Promise<void>} Sends the notification data as JSON if found, or 404 if not found
   */
    async getNotificationById(req, res) {
        try {
            // Extract the notification ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Fetch the notification by its ID
            const notification = await notificationService.getNotificationById(id);

            // If notification is not found, send a 404 error response
            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }

            // If found, return the notification data as JSON
            res.json(notification);

        } catch (error) {
            // Log error and send a response indicating internal server error
            console.error('Error fetching notification:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Creates a new notification.
   * 
   * @param {Object} req - The request object, including notification data in the body
   * @param {Object} res - The response object used to send a response
   * @returns {Promise<void>} Redirects to the notifications page after successful creation
   */
    async createNotification(req, res) {
        try {
            // Extract notification data from the request body
            const notificationData = req.body;

            // Create a new notification using the notification service
            const newNotification = await notificationService.createNotificationWithouFine(notificationData);

            // Send desktop notification
            notifier.notify({
                title: 'Notification Management',
                message: errorMessage,
                icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the notifications page
            return res.redirect('/api/notifications');

        } catch (error) {
            // Handle specific error when transaction_id does not exist
            if (error.message.includes('Borrowing Transaction')) {

                // Send desktop notification
                notifier.notify({
                    title: 'Notification Management',
                    message: error.message,
                    icon: path.join(__dirname, 'path/to/error-icon.png'), // Optional
                    sound: true, // Optional
                    // wait: true // Optional
                });

                // Redirect to the notifications page
                return res.redirect('/api/notifications');
            }

            // Log error and send a response indicating internal server error
            console.error('Error creating notification:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Deletes a notification by its ID.
   * 
   * @param {Object} req - The request object, including the notification ID in the URL params
   * @param {Object} res - The response object used to send a response
   * @returns {Promise<void>} Redirects to the notifications page after successful deletion
   */
    async deleteNotification(req, res) {
        try {
            // Extract the notification ID from the request parameters
            const id = parseInt(req.params.id, 10);

            // Call the service to delete the notification by its ID
            const success = await notificationService.deleteNotification(id);

            // Send a desktop notification 
            notifier.notify({
                title: 'Notification Management',
                message: 'Notification deleted successfully',
                icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
                sound: true, // Optional
                // wait: true // Optional
            });

            // Redirect to the notifications page
            res.redirect('/api/notifications');

        } catch (error) {
            // Log error and send a response indicating internal server error
            console.error('Error deleting notification:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Checks for pending notifications and sends them.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object used to send a response
   * @returns {Promise<void>} Responds with a success message after sending notifications
   */
    async checkAndSendNotifications(req, res) {
        try {
            // Call the service to check and send pending notifications
            await notificationService.checkAndSendNotifications();

            // Send a success response
            res.json({ message: 'Notifications checked and sent successfully' });
        } catch (error) {
            // Log error and send a response indicating internal server error
            console.error('Error checking and sending notifications:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Renders the form to add a new notification.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object used to render the form
   * @returns {Promise<void>} Renders the form to add a new notification
   */
    async addForm(req, res) {
        // Fetch all users and books for the dropdown options
        const usernames = await userService.getAllUsers();
        const book_id = await bookService.getAllBooks();

        // Render the form to add a new notification with the available users and books
        res.render('NotificationViews/addNotification', { usernames: usernames, book_id: book_id });
    }

    /**
   * Renders the form to edit an existing notification.
   * 
   * @param {Object} req - The request object, including notification ID in the URL params
   * @param {Object} res - The response object used to render the form
   * @returns {Promise<void>} Renders the form to edit the existing notification
   */
    async editForm(req, res) {
        try {
            // Extract notification ID from request parameters
            const id = parseInt(req.params.id, 10);

            // Fetch the notification by ID
            const notification = await notificationService.getNotificationById(id);

            // Render the form to edit the notification
            res.render('NotificationViews/editNotification', { notification: notification });

        } catch (error) {
            // Log error and send a response indicating internal server error
            console.error('Error deleting author:', error);
            res.status(500).json({ message: 'Internal Service error' });
        }
    }
}

module.exports = new NotificationController();

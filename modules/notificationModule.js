const moment = require("moment");

/**
 * Represents an Notification in the system. 
 * @class 
 */
class Notification {

    /**
     * Creates an instance of the Transaction class.
     * @constructor
     * @param {number} notification_id - The unique identifier for the notification.
     * @param {string} username - The username of notification.
     * @param {number} book_id - The book id of the notification.
     * @param {number} fine_id - The fine id of the notification.
     * @param {Date} reminder_date - The set date of notification.
     * @param {string} message - The message of notifiaction.
     */
    constructor(notification_id, username, book_id, fine_id, reminder_date, message) {
        this.notification_id = notification_id;
        this.username = username;
        this.book_id = book_id;
        this.fine_id = fine_id;
        this.reminder_date = reminder_date;
        this.message = message;
    }

    /**
     * Converts a database row to a Notification instance.
     * @static
     * @param {Object} row - The database row representing a notification.
     * @param {number} notification_id - The unique identifier for the notification.
     * @param {string} username - The username of notification.
     * @param {number} book_id - The book id of the notification.
     * @param {number} fine_id - The fine id of the notification.
     * @param {Date} reminder_date - The set date of notification.
     * @param {string} message - The message of notifiaction.
     * 
     * @returns {Notification} A new instance of the Notification class.
     */
    static fromRow(row) {
        return new Notification(
            row.notification_id,
            row.username,
            row.book_id,
            row.fine_id,
            moment(row.reminder_date).format("YYYY-MM-DD HH:mm:SS"),
            row.message
        );
    }
}

module.exports = Notification;

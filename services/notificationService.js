// Importing the database initialization function
const { initDB } = require("../config/database");

// Importing the Notification model for interacting with notification data
const Notification = require("../modules/notificationModule");

class NotificationService {

  // Constructor initializes the database connection pool
  constructor() {
    this.pool = null; // Database connection pool
    this.init(); //  Initialize database connection
  }

  /**
  * Initializes the database connection pool.
  * This method is called when the NotificationService is instantiated.
  */
  async init() {
    // Initialize the database connection pool
    this.pool = await initDB();
  }

  /**
   * Retrieves all notifications from the database.
   * 
   * @returns {Promise<Array>} - A promise that resolves to an array of Notification instances.
   * @throws {Error} - Throws an error if the database query fails.
   */
  async getAllNotifications() {
    // Query the database to get all notifications
    const [rows] = await this.pool.query(`
            SELECT * FROM notification`);

    // Map the rows to Notification instances
    return rows.map((row) => Notification.fromRow(row));
  }

  /**
   * Retrieves a specific notification by its ID.
   * 
   * @param {number} id - The ID of the notification to retrieve.
   * @returns {Promise<Notification|null>} - A promise that resolves to a Notification instance or null if not found.
   * @throws {Error} - Throws an error if the database query fails.
   */
  async getNotificationById(id) {
    // Query to fetch a notification by its ID
    const [rows] = await this.pool.query(
      `SELECT * FROM notification WHERE notification_id = ?`,
      [id]
    );

    // If no notification is found, return null
    if (rows.length === 0) return null;

    // Return the Notification instance created from the fetched row
    return Notification.fromRow(rows[0]);
  }

  /**
   * Retrieves all notifications for a specific user.
   * 
   * @param {string} username - The username of the user whose notifications are to be retrieved.
   * @returns {Promise<Array>} - A promise that resolves to an array of Notification instances.
   * @throws {Error} - Throws an error if the database query fails.
   */
  async getNotificationsByUser(username) {
    // Query to fetch all notifications for a specific user
    const [rows] = await this.pool.query(`
      SELECT * FROM notification WHERE username = ?`, [username]);

    // Return the results as instances of the Notification class
    return rows.map((row) => Notification.fromRow(row));
  }

  /**
   * Creates a reminder notification without fine based on the borrowing transaction.
   * 
   * @param {Object} notificationData - The data required to create the notification.
   * @param {number} notificationData.transaction_id - The ID of the borrowing transaction.
   * @returns {Promise<Notification>} - A promise that resolves to the created Notification instance.
   * @throws {Error} - Throws an error if the transaction ID does not exist or the database query fails.
   */
  async createNotificationWithouFine(notificationData) {
    const { transaction_id } = notificationData;

    // Check if the transaction id exists in the borrowing transaction table
    const [rows] = await this.pool.query(
      `SELECT transaction_id, username, book_id, issue_date, due_date FROM borrowing_transaction WHERE transaction_id = ?`,
      [transaction_id]
    );

    // If the transaction doesn't exist, throw an error or return a message
    if (rows.length === 0) {
      throw new Error(
        `Borrowing Transaction "${transaction_id}" does not exist in the borrowing table`
      );
    }

    const book_id = rows[0].book_id;
    const username = rows[0].username;
    const due_date = rows[0].due_date;
    const issue_date = rows[0].issue_date;

    // Calculate reminder date (14 days from issue date)
    const reminder_date = new Date(issue_date);
    reminder_date.setDate(reminder_date.getDate() + 14);
    const formattedReminderDate = reminder_date
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Fetch the book title
    const [titleRows] = await this.pool.query(
      `SELECT title FROM book WHERE book_id = ?`,
      [book_id]
    );

    const title = titleRows[0].title;

    // Construct the message
    const message = `Don't forget to return "${title}" before ${due_date}`;

    // Proceed with inserting the notification
    const [result] = await this.pool.query(
      "INSERT INTO notification (username, book_id, reminder_date, message) VALUES (?, ?, ?, ?)",
      [username, book_id, formattedReminderDate, message]
    );

    // Create a Notification object with the inserted data
    const insertedNotification = new Notification(
      result.insertId,
      username,
      book_id,
      null,
      formattedReminderDate,
      message
    );

    // Return the created Notification object
    return insertedNotification;
  }

  /**
   * Deletes a notification from the database by its ID.
   * 
   * @param {number} id - The ID of the notification to delete.
   * @returns {Promise<boolean>} - A promise that resolves to true if the notification was deleted, otherwise false.
   * @throws {Error} - Throws an error if the database query fails.
   */
  async deleteNotification(id) {
    // Delete the notification from the database based on the id
    const [result] = await this.pool.query(
      "DELETE FROM notification WHERE notification_id = ?",
      [id]
    );

    // Return whether any rows were affected (indicating success)
    return result.affectedRows > 0;
  }
}

module.exports = new NotificationService();

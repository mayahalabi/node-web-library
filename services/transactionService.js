// Importing the database initialization function
const { initDB } = require("../config/database");

// Importing the Transaction model for interacting with transaction data
const Transaction = require("../modules/transactionModule");
const Borrowed = require("../modules/borrowedModule");

class TransactionService {

  // Constructor initializes the database connection pool
  constructor() {
    this.pool = null; // Database connection pool
    this.init(); //  Initialize database connection
  }

  /**
     * Initializes the database connection pool.
     * This method is called when the TransactionService is instantiated.
     */
  async init() {
    // Initialize the database connection pool
    this.pool = await initDB();
  }

  /**
   * Retrieves all transactions from the database, joining related information like user and book details.
   * 
   * @returns {Promise<Array>} - A promise that resolves to an array of Transaction instances.
   * @throws {Error} - Throws an error if the database query fails.
   */
  async getAllTransactions() {
    // Query the database to get all transactions
    const [rows] = await this.pool.query(`
            SELECT bt.transaction_id,
            u.username,
            b.book_id,
            b.title,
            bt.issue_date,
            bt.due_date,
            bt.return_date
                FROM borrowing_transaction bt
                JOIN book b ON bt.book_id = b.book_id
                JOIN user u ON bt.username = u.username
        `);

    // Map the rows to Transaction instances
    return rows.map((row) => Transaction.fromRow(row));
  }

  /**
   * Retrieves a specific transaction by its ID, joining related information like user and book details.
   * 
   * @param {number} id - The ID of the transaction to retrieve.
   * @returns {Promise<Transaction|null>} - A promise that resolves to a Transaction instance or null if not found.
   * @throws {Error} - Throws an error if the database query fails.
   */
  async getTransactionById(id) {
    // Query the database for a Transaction with the specified id
    const [rows] = await this.pool.query(
      `
            SELECT bt.transaction_id,
            u.username,
            b.book_id,
            b.title,
            bt.issue_date,
            bt.due_date,
            bt.return_date
                FROM borrowing_transaction bt
                JOIN book b ON bt.book_id = b.book_id
                JOIN user u ON bt.username = u.username
            WHERE transaction_id = ?`,
      [id]
    );

    // If no transaction is found, return null
    if (rows.length == 0) return null;

    // Return the Transaction instance created from the first row
    return Transaction.fromRow(rows[0]);
  }

  /**
   * Retrieves all ongoing transactions (books not returned yet) for a specific user.
   * Includes associated book images.
   * 
   * @param {string} username - The username of the user whose transactions are to be retrieved.
   * @returns {Promise<Array|null>} - A promise that resolves to an array of Borrowed instances or null if no transactions.
   * @throws {Error} - Throws an error if the database query fails.
   */
  async getTransactionsByUsername(username) {
    // Query the database for a Transaction with the specified id
    const [rows] = await this.pool.query(
      `SELECT bt.transaction_id,
       u.username,
       b.book_id,
       b.title,
       bt.issue_date,
       bt.due_date,
       bt.return_date, 
       i.image_data, 
       i.image_type
          FROM borrowing_transaction bt
          JOIN book b ON bt.book_id = b.book_id
          JOIN user u ON bt.username = u.username
          JOIN images i ON i.image_id = b.image_id
          WHERE bt.return_date IS NULL AND u.username = ?
      `,
      [username]
    );

    // If no transaction is found, return null
    if (rows.length == 0) return null;

    // Map the rows to Borrowed instances and return
    return rows.map((row) => Borrowed.fromRow(row));
  }

  /**
   * Creates a new borrowing transaction for a user borrowing a specific book.
   * Checks if the book exists, if the user exists, and if there are available copies of the book.
   * 
   * @param {Object} transactionData - The data for creating the transaction.
   * @param {string} transactionData.username - The username of the user borrowing the book.
   * @param {number} transactionData.book_id - The ID of the book being borrowed.
   * @returns {Promise<Object>} - A promise that resolves to the details of the created transaction.
   * @throws {Error} - Throws an error if the book, user, or transaction validation fails.
   */
  async createTransaction(transactionData) {
    const { username, book_id } = transactionData;

    // Step 1: Check if the book exists in the database
    const [bookRows] = await this.pool.query(
      `SELECT book_id, quantity FROM book WHERE book_id = ?`,
      [book_id]
    );
    if (bookRows.length === 0) {
      throw new Error(`Book ID "${book_id}" does not exist in the book table.`);
    }

    const quantity = bookRows[0].quantity; // Getting the quantity of the book

    // Step 2: Check if there are available copies of the book
    if (quantity <= 0) {
      throw new Error(`No available copies of "${book_id}" to borrow.`);
    }

    // Step 3: Check if the user exists in the user table
    const [userRows] = await this.pool.query(
      "SELECT username FROM user WHERE username = ?",
      [username]
    );
    if (userRows.length === 0) {
      throw new Error(`User "${username}" does not exist in the user table.`);
    }

    // Step 4: Check if the user has already borrowed this book and hasn't returned it yet
    const [existingTransaction] = await this.pool.query(
      "SELECT transaction_id FROM borrowing_transaction WHERE username = ? AND book_id = ? AND return_date IS NULL",
      [username, book_id]
    );
    if (existingTransaction.length > 0) {
      throw new Error(`User "${username}" has already borrowed the book "${book_id}" and has not returned it yet.`);
    }

    // Step 5: Calculate the due date (1 month from now)
    const due_date = new Date();
    due_date.setMonth(due_date.getMonth() + 1); // Adding one month to the current date

    // Format the due_date correctly for MySQL (YYYY-MM-DD HH:MM:SS format)
    const formattedDueDate = due_date
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // Correctly format the due_date for MySQL

    // Step 6: Insert the transaction into the database
    const [result] = await this.pool.query(
      "INSERT INTO borrowing_transaction (username, book_id, issue_date, due_date, return_date) VALUES (?, ?, NOW(), ?, NULL)",
      [username, book_id, formattedDueDate]
    );

    // Step 7: Handle insert failure (in case result.insertId is undefined or null)
    if (!result || !result.insertId) {
      throw new Error('Failed to insert transaction into the database.');
    }

    // Step 8: Create a Transaction object with the inserted data
    const insertedTransaction = new Transaction(
      result.insertId, // Inserted transaction ID
      username,
      book_id,
      new Date(), // Issue date is NOW
      formattedDueDate, // Due date formatted
      null // No return date as it's not returned yet
    );

    // Step 9: Return the created Transaction object with insertId and other details
    return {
      insertId: result.insertId, // Include insertId in the returned object
      transaction_id: result.insertId,
      username,
      book_id,
      issue_date: insertedTransaction.issue_date,
      due_date: formattedDueDate,
      return_date: insertedTransaction.return_date,
    };
  }

  /**
   * Updates a transaction to mark the book as returned.
   * Automatically sets the return_date to the current date if the book is being returned.
   * 
   * @param {Object} transactionData - The data for updating the transaction.
   * @param {number} transactionData.id - The ID of the transaction to update.
   * @returns {Promise<Object>} - A promise that resolves to a success message.
   * @throws {Error} - Throws an error if the transaction is already completed or not found.
   */
  async updateTransaction(transactionData) {
    const { id } = transactionData;

    // Step 1: Check if the transaction exists and fetch the return_date
    const [existingTransaction] = await this.pool.query(
      "SELECT return_date FROM borrowing_transaction WHERE transaction_id = ?",
      [id]
    );

    // If no transaction found, throw an error
    if (existingTransaction.length < 1) {
      throw new Error(`Transaction with ID "${id}" not found.`);
    }

    // Fetch the return_date
    const returnDate = existingTransaction[0].return_date;

    // Step 2: If the book has already been returned, don't allow updates
    if (returnDate !== null) {
      throw new Error(`Transaction with ID "${id}" has already been completed (book returned).`);
    }

    // Step 3: Automatically set return_date to NOW if the book is being returned
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " "); // Format current date as YYYY-MM-DD HH:MM:SS

    // Step 4: Update the return_date in the transaction
    await this.pool.query(
      "UPDATE borrowing_transaction SET return_date = ? WHERE transaction_id = ?",
      [currentDate, id]
    );

    // Step 5: Return a success message
    return {
      message: "Transaction updated and book marked as returned successfully.",
    };
  }

  /**
   * Deletes a transaction from the database.
   * 
   * @param {number} id - The ID of the transaction to delete.
   * @returns {Promise<boolean>} - A promise that resolves to true if the transaction was deleted, otherwise false.
   * @throws {Error} - Throws an error if the database query fails.
   */
  async deleteTransaction(id) {
    // Delete transaction from the database based on id
    const [result] = await this.pool.query(
      "DELETE FROM borrowing_transaction WHERE transaction_id = ?",
      [id]
    );

    // Return whether any rows were affected (indicating success)
    return result.affectedRows > 0;
  }
}

module.exports = new TransactionService();

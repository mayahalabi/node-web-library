// Importing the database initialization function
const { initDB } = require('../config/database');

// Importing the Fine model for interacting with fine data
const Fine = require('../modules/fineModule');

/**
 * FineService handles operations related to fines in the system.
 * This includes CRUD operations.
 * 
 * @class FineService
 */
class FineService {

    /**
    * FineService constructor initializes the database connection pool.
    */
    constructor() {
        this.pool = null;     // Database connection pool
        this.init();         //  Initialize database connection
    }

    /**
     * Initializes the database connection pool.
     * This is called when an instance of the FineService is created.
     * 
     * @returns {Promise<void>} Resolves when the pool is initialized.
     */
    async init() {
        // Initialize the database connection pool
        this.pool = await initDB();
    }

    /**
     * Fetches all fines from the database.
     * 
     * @returns {Promise<Array>} Array of Fines objects.
     */
    async getAllFines() {
        // Query the database to get all fines
        const [rows] = await this.pool.query(`
                SELECT 
                    f.fine_id,
                    bt.username,
                    bt.transaction_id,
                    b.title AS BorrowedBook,
                    f.fine_amount,
                    f.fine_status,
                    paid_date
                FROM 
                    fine f
                JOIN 
                    borrowing_transaction bt ON f.transaction_id = bt.transaction_id
                JOIN 
                    book b ON b.book_id = bt.book_id
            `);

        // Map the rows to Fines instances
        return rows.map(row => Fine.fromRow(row));

    }

    /**
     * Fetches a fine by id.
     * 
     * @param {number} id - The id of the fine to fetch.
     * @returns {Promise<User|null>} The Fine object if found, null otherwise.
     */
    async getFineById(id) {
        // Query the database for a fine with the specified id
        const [rows] = await this.pool.query(`
            SELECT 
                f.fine_id,
                bt.username,
                bt.transaction_id,
                b.title AS BorrowedBook,
                f.fine_amount,
                f.fine_status,
                paid_date
            FROM 
                fine f
            JOIN 
                borrowing_transaction bt ON f.transaction_id = bt.transaction_id
            JOIN 
                book b ON b.book_id = bt.book_id
            WHERE f.fine_id = ?`, [id]);

        // If no fine is found, return null
        if (rows.length == 0) return null;

        // Return the Fine instance created from the fetched row
        return Fine.fromRow(rows[0]);
    }

    /**
     * Creates a new fine in the database.
     * 
     * @param {number} fineData.transaction_id - The fine's transactionId
     * 
     * @returns {Promise<User>} The newly created Fine object.
     */
    async createFine({ transaction_id }) {
        // Check if the transaction_id exists in the borrowing_transaction table
        const [transactionRows] = await this.pool.query(
            'SELECT username FROM borrowing_transaction WHERE transaction_id = ?', [transaction_id]
        );

        // If the transaction does not exist, throw an error
        if (transactionRows.length === 0) {
            throw new Error(`Transaction ID ${transaction_id} does not exist in the borrowing transaction table`);
        }

        const username = transactionRows[0].username;  // Get the username from the transaction

        // Insert the new fine record into the fine table
        const [result] = await this.pool.query(
            'INSERT INTO fine (transaction_id, fine_amount, fine_status) VALUES (?, 40, "unpaid")',
            [transaction_id]
        );

        // Return the inserted fine details including the username
        return {
            fine_id: result.insertId,
            username: username,  // Include the username in the response
            transaction_id: transaction_id,
            fine_amount: 40,
            fine_status: 'unpaid',
        };
    }

    /**
    * Updates the fine status for a given fine ID, marking it as "paid" and setting the paid date.
    * 
    * @param {number} fine_id - The ID of the fine to update.
    * 
    * @returns {Promise<Object|null>} A promise that resolves to the updated fine object if successful, or `null` if no rows were updated.
    * @throws {Error} Throws an error if the fine is not found or if the fine is already marked as "paid".
    */
    async updateFine(fine_id) {

        // Check if fine is available
        const [currentFine] = await this.pool.query(`SELECT fine_status FROM fine WHERE fine_id = ?`, [fine_id]);
        if (currentFine.length === 0) {
            throw new Error('Fine not found.');
        }

        // Check if its paid
        if (currentFine[0].fine_status === "paid") {
            throw new Error('Check was paid.');
        }

        // Update the fine status to "paid" and set the paid date
        const [result] = await this.pool.query(
            `UPDATE fine SET fine_status = "paid", paid_date = NOW() WHERE fine_id = ?`,
            [fine_id]
        );

        // If no rows were affected, return null
        if (result.affectedRows === 0) return null;

        // Fetch and return the updated fine details
        return this.getFineById(fine_id);
    }

    /**
    * Deletes a fine from the database by its ID.
    * 
    * @param {number} id - The ID of the fine to delete.
    * 
    * @returns {Promise<boolean>} `true` if the fine was deleted, `false` otherwise.
    */
    async deleteFine(id) {
        // Delete transaction from the database based on id
        const [result] = await this.pool.query('DELETE FROM fine WHERE fine_id = ?', [id]);
        return result.affectedRows > 0; // Indicate success or failure of deletion
    }
}

module.exports = new FineService();
// Importing the database initialization function
const { initDB } = require('../config/database');

// Importing the User model for interacting with user data
const User = require('../modules/userModule');

class UserService {

    // Constructor initializes the database connection pool
    constructor() {
        this.pool = null;     // Database connection pool
        this.init();         //  Initialize database connection
    }

    /**
     * Initializes the database connection pool.
     * This method is called when the UserService is instantiated.
     */
    async init() {
        // Initialize the database connection pool
        this.pool = await initDB();
    }

    /**
     * Retrieves all users from the database.
     * 
     * @returns {Promise<Array>} - A promise that resolves to an array of User instances.
     * @throws {Error} - Throws an error if the query fails.
     */
    async getAllUsers() {
        // Query the database to get all users
        const [rows] = await this.pool.query('SELECT * FROM user');

        // Map the rows to User instances
        return rows.map(User.fromRow);
    }

    /**
     * Retrieves a user by their username from the database.
     * 
     * @param {string} username - The username of the user to retrieve.
     * @returns {Promise<User|null>} - A promise that resolves to a User instance or null if not found.
     * @throws {Error} - Throws an error if the query fails.
     */
    async getUserByUsername(username) {
        // Query the database for a user with the specified username
        const [rows] = await this.pool.query(
            'SELECT * FROM user WHERE username = ?', [username]
        );

        // If no user is found, return null
        if (rows.length === 0) return null;

        // Return the User instance created from the fetched row
        return User.fromRow(rows[0]);
    }

    /**
     * Creates a new user in the database.
     * 
     * @param {Object} userData - The data for the new user.
     * @param {string} userData.username - The username of the new user.
     * @param {string} userData.first_name - The first name of the new user.
     * @param {string} userData.last_name - The last name of the new user.
     * @param {string} userData.email - The email of the new user.
     * @param {string} userData.phoneNumber - The phone number of the new user.
     * @param {string} userData.address - The address of the new user.
     * @param {string} userData.role - The role of the new user.
     * @param {string} userData.password - The password for the new user.
     * @returns {Promise<User>} - A promise that resolves to the created User instance.
     * @throws {Error} - Throws an error if the username already exists or if the query fails.
     */
    async createUser(userData) {
        const { username, first_name, last_name, email, phoneNumber, address, role, password } = userData;

        // Check if username already exists
        const [existingUser] = await this.pool.query(
            'SELECT * FROM user WHERE username = ?',
            [username]
        );

        // If the username already exists, throw an error or return a message
        if (existingUser.length > 0) {
            throw new Error('Username already exists');
        }

        // Insert the new user into the database
        const [result] = await this.pool.query(
            'INSERT INTO user (username, first_name, last_name, email, phone_number, address, role, registration_date, password) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)',
            [username, first_name, last_name, email, phoneNumber, address, role, password]
        );

        // Create a User object with the inserted data
        const insertedUser = new User(username, first_name, last_name, email, phoneNumber, address, role, new Date(), password);

        // Return the created User object
        return insertedUser;
    }

    /**
     * Updates an existing user's information in the database.
     * 
     * @param {string} username - The username of the user to update.
     * @param {Object} userData - The new data for the user.
     * @param {string} userData.first_name - The first name of the user.
     * @param {string} userData.last_name - The last name of the user.
     * @param {string} userData.email - The email of the user.
     * @param {string} userData.phoneNumber - The phone number of the user.
     * @param {string} userData.address - The address of the user.
     * @param {string} userData.role - The role of the user.
     * @param {string} userData.password - The password for the user.
     * @returns {Promise<boolean>} - A promise that resolves to `true` if the update is successful, `false` otherwise.
     * @throws {Error} - Throws an error if the query fails.
     */
    async updateUser(username, userData) {
        const { first_name, last_name, email,
            phoneNumber, address, role, password } = userData;

        // Update the user's information in the database
        const [result] = await this.pool.query(
            'UPDATE user SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?, role = ?, ' +
            'last_updatedAt = NOW(), password = ? WHERE username = ?',
            [first_name, last_name, email,
                phoneNumber, address, role, password, username]
        );

        // Return whether any rows were affected (indicating success)
        return result.affectedRows > 0;
    }

    /**
     * Deletes a user from the database based on their username.
     * 
     * @param {string} username - The username of the user to delete.
     * @returns {Promise<boolean>} - A promise that resolves to `true` if the user was deleted, `false` otherwise.
     * @throws {Error} - Throws an error if the query fails.
     */
    async deleteUser(username) {
        // Delete the user from the database based on the username
        const [result] = await this.pool.query(
            'DELETE FROM user WHERE username = ?', [username]
        );

        // Return whether any rows were affected (indicating success)
        return result.affectedRows > 0;
    }

    /**
     * Checks whether a user exists by their username.
     * 
     * @param {string} username - The username of the user to check.
     * @returns {Promise<boolean>} - A promise that resolves to `true` if the user exists, `false` otherwise.
     * @throws {Error} - Throws an error if the query fails.
     */
    async checkUserExists(username) {
        // Query the database to check if the username exists
        const [rows] = await this.pool.query('SELECT username FROM user WHERE username = ?',
            [username]);

        // Return true if any rows were returned, indicating the username exists
        return rows.length > 0;
    }

    /**
     * Validates a user's credentials (username and password) during sign-in.
     * 
     * @param {Object} signIn - The sign-in credentials.
     * @param {string} signIn.username - The username of the user attempting to sign in.
     * @param {string} signIn.password - The password of the user attempting to sign in.
     * @returns {Promise<Object>} - A promise that resolves to an object containing the result of the sign-in attempt.
     * @throws {Error} - Throws an error if the validation process fails.
     */
    async signIn(signIn) {
        try {
            const { username, password } = signIn;

            // Query the database for the user
            const [rows] = await this.pool.query(`SELECT * FROM user WHERE username = ?`, [username]);

            // Check if the username exists
            if (rows.length === 0) {
                return { success: false, message: 'Invalid username' }; // Return error for missing user
            }

            const user = rows[0]; // Get the user object
            const correctPass = user.password; // Extract the stored password
            let role;
            // Check if the password matches
            if (password === correctPass) {
                role = user.role; // Set the role from the database directly
                return { success: true, role, username: user.username }; // Return success with role and username
            }

            return { success: false, message: 'Incorrect password' }; // Return error for password mismatch
        } catch (e) {
            throw new Error(`Error validating username and password: ${e.message}`);
        }
    }

    /**
     * Retrieves the password for a user based on their username.
     * 
     * @param {string} username - The username of the user whose password is to be retrieved.
     * @returns {Promise<string|null>} - A promise that resolves to the password if the user exists, otherwise `null`.
     * @throws {Error} - Throws an error if the query fails.
     */
    async getPassword(username) {
        // Query the database for the user's password with the specified username
        const [rows] = await this.pool.query(
            'SELECT password FROM user WHERE username = ?', [username]
        );

        // If no user is found, return null
        if (rows.length === 0) return null;

        // return the password directly
        return rows[0].password;
    }

    /**
    * Creates a new user in the system with the provided data.
    * 
    * This method checks if the username already exists in the database. If it does, an error is thrown.
    * If the username is unique, it inserts the new user into the database and returns a User object 
    * representing the created user.
    * 
    * @param {Object} userData - The data for the new user to be created.
    * @param {string} userData.username - The username of the user.
    * @param {string} userData.first_name - The first name of the user.
    * @param {string} userData.last_name - The last name of the user.
    * @param {string} userData.email - The email address of the user.
    * @param {string} userData.phoneNumber - The phone number of the user.
    * @param {string} userData.address - The address of the user.
    * @param {string} userData.role - The role of the user (e.g., 'admin', 'user').
    * @param {string} userData.password - The hashed password of the user.
    * 
    * @returns {User} - The newly created User object, containing the user data.
    * 
    * @throws {Error} - If the username already exists in the database, an error is thrown with the message 'Username already exists'.
    */
    async createUserADMIN(userData) {
        const { username, first_name, last_name, email, phoneNumber, address, role, password } = userData;

        // Check if username already exists
        const [existingUser] = await this.pool.query(
            'SELECT * FROM user WHERE username = ?',
            [username]
        );

        // If the username already exists, throw an error or return a message
        if (existingUser.length > 0) {
            throw new Error('Username already exists');
        }

        // Insert the new user into the database
        const [result] = await this.pool.query(
            'INSERT INTO user (username, first_name, last_name, email, phone_number, address, role, registration_date, password) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)',
            [username, first_name, last_name, email, phoneNumber, address, role, password]
        );

        // Create a User object with the inserted data
        const insertedUser = new User(username, first_name, last_name, email, phoneNumber, address, role, new Date(), password);

        // Return the created User object
        return insertedUser;
    }
}

module.exports = new UserService();
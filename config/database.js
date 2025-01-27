// config/database.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;

const initDB = async () => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3307,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        // Test the connection
        try {
            await pool.getConnection();
            console.log('Connected to MySQL database');
        } catch (error) {
            console.error('Unable to connect to MySQL:', error);
            process.exit(1);
        }
    }
    return pool;
};

module.exports = { initDB };

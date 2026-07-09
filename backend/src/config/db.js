const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'college_secure_pass',
  database: process.env.DB_NAME || 'college_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

console.log(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}...`);

const pool = mysql.createPool(dbConfig);

// Helper function to test DB connection and retry on failure
async function testConnection(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('Successfully connected to MySQL database.');
      connection.release();
      return true;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  console.error('Could not connect to database. Moving forward, but database calls will fail.');
  return false;
}

module.exports = {
  pool,
  testConnection
};

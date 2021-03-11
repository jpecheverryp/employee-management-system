// Creating connection to database
const mysql = require("mysql");
require('dotenv').config();

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "EMS_DB"
});

module.exports = connection;
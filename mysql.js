const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

db.connect((e) => {
    if(e) throw e;
    console.log("Připojení na databázi proběhlo úspěšně!");
    //Pingování databáze (Některé servery rádi ukončují spojení bez aktivity)
    setInterval(() => {
        db.ping();
    }, 15 * 60 * 1000);
})

module.exports = db;
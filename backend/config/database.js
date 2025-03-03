const mongooes = require('mongoose');
const config = require('../config/config');

const connectDb = () => {
    try {
        console.log(config.db_uri);
        
        mongooes.connect(config.db_uri);
        console.log("db connected:");
        
    } catch (error) {
        console.log("Db connection error:" + error);
        process.exit();
    }
}
 
module.exports = connectDb; 
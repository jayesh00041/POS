const mongooes = require('mongoose');
const config = require('../config/config');

const connectDb = () => {
    try {
        mongooes.connect(config.db_uri);
    } catch (error) {
        process.exit();
    }
}
 
module.exports = connectDb; 
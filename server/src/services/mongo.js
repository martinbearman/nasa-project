
require('dotenv').config();

const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI;

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!');
});
  
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

async function mongoConnect() {
    if (!MONGO_URL) {
        throw new Error(
            'MongoDB connection string is missing. Set MONGO_URL or MONGODB_URI.',
        );
    }
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}
module.exports = {
    mongoConnect,
    mongoDisconnect,
};
const MongoClient = require('mongodb').MongoClient;

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connectDb = client.connect();

module.exports = async function() {
    const connect = await connectDb;
    console.log('connected to mongoose');
    return connect.db('spyfall');
};
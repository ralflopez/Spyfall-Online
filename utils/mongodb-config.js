const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://passwordmongo:passwordmongo@cluster0.oixjm.mongodb.net/spyfall?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connectDb = client.connect();

module.exports = async function() {
    const connect = await connectDb;
    return connect.db('spyfall');
};
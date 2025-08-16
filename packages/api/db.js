import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('status-check');
  }
  return db;
}

async function disconnectDB() {
  await client.close();
  db = null;
}

export { connectDB, disconnectDB };

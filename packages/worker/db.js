import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

let db;

export async function connectDB() {
  try {
    if (!db) {
      await client.connect();
      db = client.db('status-check');
    }
    return db;
  } catch (error) {
    console.error('Connection error:', error);
  }
}

export async function disconnectDB() {
  try {
    await client.close();
    db = null;
  } catch (error) {
    console.error('Disconnection error:', error);
  }
}

export const createCheckResult = async ({ id, websiteId, createdAt, check, result, quickcheckId }) => {
  await db.collection('checks').insertOne({
    jobId: id,
    websiteId,
    check,
    result,
    createdAt,
    quickcheckId
  });
  console.log('finished check', check)
};


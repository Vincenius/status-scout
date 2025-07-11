import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

let db;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db('status-check');
    return db;
  } catch (error) {
    console.error('Connection error:', error);
  }
}

export async function disconnectDB() {
  try {
    await client.close();
  } catch (error) {
    console.error('Disconnection error:', error);
  }
}

export const updateCheck = async ({ db, userId, createdAt, check, result }) => {
  const updateKey = `checks.$[elem].${check}`;

  await db.collection('users').updateOne(
    { _id: userId },
    {
      $set: {
        [updateKey]: result
      }
    },
    {
      arrayFilters: [
        { 'elem.created_at': createdAt }
      ]
    }
  );
};

export { db };

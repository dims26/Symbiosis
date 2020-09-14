import mongoPkg from 'mongodb';

const { MongoClient } = mongoPkg;
const dbName = process.env.DB_NAME;
let db;

console.log(process.env.MONGO_CONNECTION_STRING);
if (!process.env.MONGO_CONNECTION_STRING) {
  throw new Error('Environment variable MONGO_CONNECTION_STRING must be set to use API.');
}
const client = MongoClient.connect(process.env.MONGO_CONNECTION_STRING,
  { useUnifiedTopology: true });

/**
 * Returns a promise of a `db` object. Subsequent calls to this function returns
 * the **same** promise, so it can be called any number of times without setting
 * up a new connection every time.
 */
const database = async () => {
  if (!db) {
    const cli = await client;
    db = cli.db(dbName);
  }

  return db;
};

export default database;

/**
 * Returns a ready-to-use `collection` object from MongoDB.
 *
 * Usage:
 *   (await getCollection('users')).find().toArray().then( ... )
 */
export async function getCollection(collectionName) {
  const datab = await database();
  return datab.collection(collectionName);
}

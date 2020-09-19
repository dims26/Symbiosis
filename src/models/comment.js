/* eslint-disable import/extensions */
import database, { getCollection } from '../db/db.js';

let coll;
const dbName = process.env.DB_NAME;
const commentName = process.env.DB_COMMENT_COLLECTION_NAME;
const commentSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['date_time', 'post_id', 'owner_id', 'body'],
    properties: {
      _id: {
        bsonType: 'objectId',
      },
      owner_id: {
        bsonType: 'objectId',
      },
      post_id: {
        bsonType: 'objectId',
      },
      date_time: {
        bsonType: 'date',
        description: 'must be a timestamp',
      },
      body: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
    },
  },
};

const commentCollection = async () => {
  if (!coll) {
    const db = await database(dbName);
    coll = await getCollection(commentName);
    db.listCollections({ name: commentName }).hasNext((err, res) => {
      if (!res) {
        db.createCollection(commentName, {
          validator: commentSchema,
        });
      }
    });
  }

  return coll;
};

export default commentCollection;

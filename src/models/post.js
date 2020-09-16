/* eslint-disable import/extensions */
import database, { getCollection } from '../db/db.js';

let coll;
// eslint-disable-next-line no-useless-escape
export const urlRegex = '(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)';
const dbName = process.env.DB_NAME;
const postName = process.env.DB_POST_COLLECTION_NAME;
const postSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['date_time', 'type', 'owner_id'],
    properties: {
      _id: {
        bsonType: 'objectId',
      },
      owner_id: {
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
      gif_link: {
        bsonType: 'string',
        pattern: urlRegex,
        description: 'must be a string, match the regex and is required',
      },
      comment_ids: {
        bsonType: ['array'],
        minItems: 0,
        additionalProperties: false,
        items: {
          bsonType: ['string'],
          description: 'must be a string',
        },
      },
      tags: {
        bsonType: ['array'],
        minItems: 0,
        uniqueItems: true,
        additionalProperties: false,
        items: {
          bsonType: ['string'],
          description: 'must be a string',
        },
      },
      type: {
        enum: ['article', 'gif'],
        description: 'can only be one of the enum values and is required',
      },
    },
  },
};

const postCollection = async () => {
  if (!coll) {
    const db = await database(dbName);
    coll = await getCollection(postName);
    db.listCollections({ name: postName }).hasNext((err, res) => {
      if (!res) {
        db.createCollection(postName, {
          validator: postSchema,
        });
      }
    });
  }

  return coll;
};

export default postCollection;

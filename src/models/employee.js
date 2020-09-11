import database, { getCollection } from '../db/db.js';

let coll;
const employeeName = 'employee';
const emplSchema = {
  $jsonSchema: {
    bsonType: 'object',
    additionalProperties: false,
    required: ['name', 'email', 'department'],
    properties: {
      _id: {
        bsonType: 'objectId',
      },
      name: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
      email: {
        bsonType: 'string',
        pattern: '.+@.+',
        description: 'must be a string and match the basic email regex',
      },
      department: {
        bsonType: 'string',
        description: 'must be a string and is required',
      },
    },
  },
};

const employeeCollection = async () => {
  if (!coll) {
    const db = await database('symbiosis-db');
    coll = await getCollection(employeeName);
    db.listCollections({ name: employeeName }).hasNext((err, res) => {
      if (!res) {
        db.createCollection(employeeName, {
          validator: emplSchema,
        });
      }
    });
  }

  return coll;
};

export default employeeCollection;

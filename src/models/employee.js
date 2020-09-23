import database, { getCollection } from '../db/db.js';

let coll;
const dbName = process.env.DB_NAME;
const employeeName = process.env.DB_EMPLOYEE_COLLECTION_NAME;
const emplSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'department', 'type'],
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
      type: {
        enum: ['admin', 'regular'],
        description: 'can only be one of the enum values and is required',
      },
      password: {
        bsonType: 'string',
        description: 'must be a string and is not required',
      },
    },
  },
};

const employeeCollection = async () => {
  if (!coll) {
    const db = await database(dbName);
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

import expressPkg from 'express';
import bodyParser from 'body-parser';
import collPromise from '../models/employee.js';

const { Router } = expressPkg;
const { urlencoded, json } = bodyParser;
const router = Router();

router.use(json());
router.use(urlencoded({ extended: true }));

function signup(expressRouter, collection) {
  expressRouter.post('/signup', (req, res) => {
    console.log(req.body);
    collection.insertOne({
      name: req.body.name.toString(),
      email: req.body.email.toString(),
      department: req.body.department.toString(),
    }, (err, user) => {
      if (err) {
        return res.status(500).json({
          status: res.statusCode,
          error: 'There was a problem adding the information to the database.',
          detail: err,
        });
      }
      return res.status(200).json({
        status: res.statusCode,
        message: 'User created successfully',
        data: user,
      });
    });
  });
}

function getAllUsers(expressRouter, collection) {
  expressRouter.get('/', (req, res) => {
    collection.find({}, (err, users) => {
      if (err) {
        return res.status(500).json({
          status: 'There was a problem finding the users.',
          error: 'There was a problem getting the information from the database',
        });
      }
      return res.status(200).json({
        status: res.statusCode,
        message: 'Successful',
        data: users,
      });
    });
  });
}

export default async function getRouter() {
  const emplCollection = await collPromise();
  // ADD THIS PART
  // CREATES A NEW USER
  signup(router, emplCollection);

  // Sample, I don't think this is needed in this state
  // RETURNS ALL THE USERS IN THE DATABASE
  getAllUsers(router, emplCollection);

  return router;
}

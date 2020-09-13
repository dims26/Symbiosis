import expressPkg from 'express';
import bodyParser from 'body-parser';
import mongoPkg from 'mongodb';
import collPromise from '../models/employee.js';
import verifyToken, { signToken, checkPassword, hashPassword } from '../middleware/auth.js';

const { Router } = expressPkg;
const { urlencoded, json } = bodyParser;
const { ObjectId } = mongoPkg;
const router = Router();

router.use(json());
router.use(urlencoded({ extended: true }));

function login(expressRouter, collection) {
  expressRouter.post('/login', (req, res) => {
    collection.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        return res.status(500).json({
          status: res.statusCode,
          error: 'Server Error',
        });
      }
      if (!user) {
        return res.status(404).json({
          status: res.statusCode,
          error: 'No user found',
        });
      }

      const passwordIsValid = checkPassword(req.body.password || '', user.password);
      if (!passwordIsValid) {
        return res.status(401).json(
          {
            status: res.statusCode,
            error: 'Invalid login credentials',
          },
        );
      }

      const token = signToken(user._id);

      return res.status(200).json({
        status: res.statusCode,
        message: 'Logged in successfully',
        data: {
          token,
        },
      });
    });
  });
}

function add(expressRouter, collection) {
  expressRouter.post('/add', verifyToken, (req, res) => {
    // search for requester in database
    collection.findOne({ _id: ObjectId(req.userId), type: 'admin' }).then((result) => {
      console.log(req.userId);
      if (!result) {
        return res.status(401).json({
          status: res.statusCode,
          error: 'Unauthorized access. Privileged operation.',
        });
      }

      // if request is from an admin, create new user
      let employeeType;
      if (req.body.isAdmin === 'true') employeeType = 'admin';
      else employeeType = 'regular';
      collection.insertOne({
        name: req.body.name.toString(),
        email: req.body.email.toString(),
        department: req.body.department.toString(),
        type: employeeType,
        password: hashPassword(req.body.password),
      }, (err, insertResult) => {
        if (err) {
          return res.status(500).json({
            status: res.statusCode,
            error: 'There was a problem adding the user to the database.',
            detail: err,
          });
        }
        return res.status(200).json({
          status: res.statusCode,
          message: 'User created successfully',
          data: {
            id: insertResult.insertedId,
          },
        });
      });
    }).catch(() => res.status(500).json({
      status: res.statusCode,
      error: 'Server Error.',
    }));
  });
}

function getAllUsers(expressRouter, collection) {
  expressRouter.get('/', verifyToken, (req, res) => {
    collection.find({}, { projection: { _id: 0 } }).toArray((err, users) => {
      if (err) {
        return res.status(500).json({
          status: res.statusCode,
          error: 'There was a problem getting the information from the database',
        });
      }
      console.log(users);
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
  // create a new user
  add(router, emplCollection);
  // Employee login
  login(router, emplCollection);

  // Sample, I don't think this is needed in this state
  // RETURNS ALL THE USERS IN THE DATABASE
  getAllUsers(router, emplCollection);

  return router;
}

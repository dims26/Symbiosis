import expressPkg from 'express';
import bodyParser from 'body-parser';

const { Router } = expressPkg;
const { urlencoded, json } = bodyParser;
let router;

export default function getRouter() {
  router = Router();

  router.use(json());
  router.use(urlencoded({ extended: true }));

  return router;
}

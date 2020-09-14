import express from 'express';
import employeeRouter from './routers/empl-routes.js';

const app = express();

export default async function getApp() {
  const router = await employeeRouter();
  app.use('/api/v1/employees', router);
  return app;
}

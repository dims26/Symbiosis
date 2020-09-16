/* eslint-disable import/extensions */
import express from 'express';
import employeeRouter from './routers/empl-routes.js';
import postRouter from './routers/posts-routes.js';

const app = express();

export default async function getApp() {
  const emplRouter = await employeeRouter();
  const pRouter = await postRouter();
  app.use('/api/v1/posts', pRouter);
  app.use('/api/v1/employees', emplRouter);
  return app;
}

/* eslint-disable import/extensions */
import {} from 'dotenv/config.js';
import app from './app.js';

const port = process.env.PORT || 3300;

async function start() {
  const application = await app();
  application.set('port', port);

  application.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

start();

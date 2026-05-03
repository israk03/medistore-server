import 'dotenv/config';
import app from './app';
import { config } from './config/env';

async function main() {
  try {
    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

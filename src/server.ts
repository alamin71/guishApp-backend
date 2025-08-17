import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import initializeSocketIO from './socketIo';

let server: Server;
export let io: any; // Export io for use in other files

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    const port = Number(config.port) || 5000;

    if (config.NODE_ENV === 'production') {
      server = app.listen(port, () => {
        console.log(`App is listening on port ${port}`);
        io = initializeSocketIO(server); // assign and export io
      });
    } else {
      server = app.listen(port, config.ip as string, () => {
        console.log(`App is listening on ${config.ip}:${port}`);
        io = initializeSocketIO(server); // assign and export io
      });
    }
  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});

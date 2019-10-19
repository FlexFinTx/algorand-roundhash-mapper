import * as express from 'express';
import * as mongoose from 'mongoose';

class App {
  public app: express.Application;
  public mongoURL: string = process.env.MONGO_URL || '';
  private options = {
    user: process.env.MONGO_USERNAME,
    pass: process.env.MONGO_PASSWORD,
    keepAlive: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
  };

  constructor() {
    this.app = express();
    this.config();
    if (this.mongoURL == '' || !this.mongoURL) {
      console.error('FATAL: MongoDB URL is missing. Exiting...');
      process.exit(1);
    }
    this.mongoSetup();
  }

  private config(): void {
    var cors = require('cors');
    this.app.use(cors());
  }

  private mongoSetup(): void {
    mongoose.connect(this.mongoURL, this.options);
  }
}

mongoose.connection.on('connected', () => {
  console.log('Successfully connected to MongoDB!');
});

mongoose.connection.on('error', (err: Error) => {
  console.error(
    'ERROR: Something went wrong with MongoDB connection: ' +
      err +
      '. Exiting...'
  );
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log('WARN: Disconnected from MongoDB');
});

export default new App().app;

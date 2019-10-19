import * as express from 'express';
import * as mongoose from 'mongoose';
import { Routes } from './routes/routes';
import Axios from 'axios';
import { NumHashModel } from './models/numHashModel';

class App {
  public app: express.Application;
  public routes: Routes = new Routes();
  public mongoURL: string = process.env.MONGO_URL || '';
  public psBaseURL: string = process.env.PS_BASE_URL || '';
  private START_ROUND: number = Number(process.env.START_ROUND) || 0;
  private CUR_ROUND: number = this.START_ROUND;
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
    this.routes.routes(this.app);
    if (this.mongoURL == '' || !this.mongoURL) {
      console.error('FATAL: MongoDB URL is missing. Exiting...');
      process.exit(1);
    }
    if (this.psBaseURL == '' || !this.psBaseURL) {
      console.error('FATAL: PureStake API base URL is missing. Exiting...');
      process.exit(1);
    }
    this.mongoSetup();
    this.startWork();
  }

  private config(): void {
    var cors = require('cors');
    this.app.use(cors());
  }

  private mongoSetup(): void {
    mongoose.connect(this.mongoURL, this.options);
  }

  private startWork(): void {
    const headers = {
      accept: 'application/json',
      'x-api-key': process.env.PS_API_KEY
    };

    NumHashModel.findOne({})
      .sort('-round')
      .exec((err, result) => {
        if (err) return console.log('Error getting current state of database');
        if (!result) return console.log('No documents found');
        this.START_ROUND = result.toObject().round;
        this.CUR_ROUND = this.START_ROUND + 1;
        console.log('Current State: Block Round #' + this.CUR_ROUND);
      });

    const instance = Axios.create({
      headers: headers
    });

    setInterval(async () => {
      await this.getAndSaveLatestBlockMapping(instance);
    }, 2500);
  }

  private async getAndSaveLatestBlockMapping(instance: any) {
    let response = await instance.get(`${this.psBaseURL}${this.CUR_ROUND}`);

    const nh = {
      hash: response.data.hash,
      round: response.data.round
    };

    if (!nh.hash || !nh.round) {
      console.log('PureStake returned error. Skipping...');
      return;
    }

    this.CUR_ROUND += 1;

    await NumHashModel.findOneAndUpdate(
      nh,
      nh,
      { upsert: true },
      (err, _doc) => {
        if (err) return console.log(err);
        console.log(`Saved block #${nh.round} with hash ${nh.hash}`);
      }
    );
    return nh;
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

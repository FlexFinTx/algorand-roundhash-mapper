import 'reflect-metadata';
import * as express from 'express';
import { Routes } from './routes/routes';
import Axios from 'axios';
import { RoundHash } from './models/roundHashModel';
import { createConnection, ConnectionOptions } from 'typeorm';

class App {
  public app: express.Application;
  public routes: Routes = new Routes();
  private dbHost: string = process.env.DB_HOST || '';
  private dbUsername: string = process.env.DB_USERNAME || '';
  private dbPassword: string = process.env.DB_PASSWORD || '';
  public psBaseURL: string = process.env.PS_BASE_URL || '';
  private WAIT_TIME_MS: number = Number(process.env.WAIT_TIME_MS) || 3000;
  private START_ROUND: number = Number(process.env.START_ROUND) || 0;
  private CUR_ROUND: number = this.START_ROUND;
  public options: ConnectionOptions = {
    type: 'postgres',
    host: this.dbHost,
    port: 5432,
    username: this.dbUsername,
    password: this.dbPassword,
    database: 'mapperdb',
    synchronize: true,
    logging: false,
    entities: [__dirname + '/models/*.js']
  };

  constructor() {
    this.app = express();
    this.config();
    this.routes.routes(this.app);
    if (this.dbHost == '' || !this.dbHost) {
      console.error('FATAL: DB Host is missing. Exiting...');
      process.exit(1);
    }
    if (this.dbUsername == '' || !this.dbUsername) {
      console.error('FATAL: DB Username is missing. Exiting...');
      process.exit(1);
    }
    if (this.dbPassword == '' || !this.dbPassword) {
      console.error('FATAL: DB Password is missing. Exiting...');
      process.exit(1);
    }
    if (this.psBaseURL == '' || !this.psBaseURL) {
      console.error('FATAL: PureStake API base URL is missing. Exiting...');
      process.exit(1);
    }

    this.startWork();
  }

  private config(): void {
    var cors = require('cors');
    this.app.use(cors());
  }

  private async startWork() {
    const headers = {
      accept: 'application/json',
      'x-api-key': process.env.PS_API_KEY
    };

    createConnection(this.options)
      .then(async connection => {
        let roundHashRepository = connection.getRepository(RoundHash);
        let result = await roundHashRepository
          .createQueryBuilder('roundhashes')
          .orderBy('round', 'DESC')
          .getOne();
        if (!result) return console.log('No documents found');
        this.START_ROUND = result.round;
        this.CUR_ROUND = this.START_ROUND + 1;
        console.log('Current State: Block Round #' + this.CUR_ROUND);
      })
      .catch(err => {
        console.error(err);
      });

    const instance = Axios.create({
      headers: headers
    });

    setInterval(async () => {
      await this.getAndSaveLatestBlockMapping(instance);
    }, this.WAIT_TIME_MS);
  }

  private async getAndSaveLatestBlockMapping(instance: any) {
    let response = await instance.get(`${this.psBaseURL}${this.CUR_ROUND}`);

    const roundHash = new RoundHash();
    roundHash.hash = response.data.hash;
    roundHash.round = response.data.round;

    if (!roundHash.hash || !roundHash.round) {
      console.log('PureStake returned error. Skipping...');
      return;
    }

    this.CUR_ROUND += 1;

    await roundHash
      .save()
      .then(rh => {
        console.log(`Saved block #${rh.round} with hash ${rh.hash}`);
      })
      .catch(err => {
        console.error(err);
      });
  }
}

export default new App().app;

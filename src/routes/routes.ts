import * as express from 'express';
import { RoundHash } from '../models/roundHashModel';
import { createConnection, ConnectionOptions } from 'typeorm';

export class Routes {
  public routes(app: express.Application, options: ConnectionOptions): void {
    app
      .route('/:hash')
      .get(async (req: express.Request, res: express.Response) => {
        createConnection(options)
          .then(async connection => {
            let roundHashRepository = connection.getRepository(RoundHash);
            let result = await roundHashRepository.findOne({
              hash: req.params.hash
            });
            if (!result) {
              return res.json({
                error: `Entry for block hash ${req.params.hash} not found`
              });
            }
            return res.json({
              hash: req.params.hash,
              round: result.round
            });
          })
          .catch(err => {
            console.error(err);
          });
      });
  }
}

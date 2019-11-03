import * as express from 'express';
import { RoundHash } from '../models/roundHashModel';
import { getManager } from 'typeorm';

export class Routes {
  public routes(app: express.Application): void {
    app
      .route('/:hash')
      .get(async (req: express.Request, res: express.Response) => {
        let roundHashRepository = getManager().getRepository(RoundHash);
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
      });
  }
}

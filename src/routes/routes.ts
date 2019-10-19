import * as express from 'express';
import { NumHashModel } from '../models/numHashModel';

export class Routes {
  public routes(app: express.Application): void {
    app.route('/:hash').get((req: express.Request, res: express.Response) => {
      NumHashModel.findOne({ hash: req.params.hash }, (err, result) => {
        if (err) {
          return res.send(err);
        }
        if (!result) {
          return res.json({
            error: `Entry for block hash ${req.params.hash} not found`
          });
        }
        return res.json({
          hash: req.params.hash,
          round: result.toObject().round
        });
      });
    });
  }
}

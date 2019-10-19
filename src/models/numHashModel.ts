import * as mongoose from 'mongoose';

const NumHashSchema = new mongoose.Schema({
  hash: String,
  round: Number
});

export const NumHashModel = mongoose.model('NumHash', NumHashSchema);

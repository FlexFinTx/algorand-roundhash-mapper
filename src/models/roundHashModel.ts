import * as mongoose from 'mongoose';

const RoundHashSchema = new mongoose.Schema({
  hash: String,
  round: Number
});

export const RoundHashModel = mongoose.model('RoundHash', RoundHashSchema);

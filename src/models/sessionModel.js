const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true }, // Поле для refreshToken
  accessTokenValidUntil: { type: Date, required: true },
  refreshTokenValidUntil: { type: Date, required: true }, // Поле для срока действия refreshToken
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;

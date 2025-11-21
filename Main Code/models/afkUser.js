const mongoose = require('mongoose');

const afkUserSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  reason: { type: String, default: '' },
  timestamp: { type: Number, required: true },
  originalNickname: { type: String }
});

module.exports = mongoose.model('AfkUser', afkUserSchema);

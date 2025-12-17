const mongoose = require('mongoose');

const afkUserSchema = new mongoose.Schema({
  // ID server tempat pengguna AFK berada
  guildId: { type: String, required: true },
  
  // ID pengguna yang ditandai sebagai AFK
  userId: { type: String, required: true },

  // Alasan pengguna tersebut AFK
  reason: { type: String, default: '' },

  // Waktu kapan pengguna ditandai sebagai AFK
  timestamp: { type: Number, required: true },  

  // Nickname asli pengguna sebelum AFK (jika ada)
  originalNickname: { type: String }
});

module.exports = mongoose.model('AfkUser', afkUserSchema);
const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
    
    // ID server tempat peringatan diberikan
    guildId: { type: String, required: true },

    // ID pengguna yang diberi peringatan
    userId: { type: String, required: true },

    // Jumlah peringatan yang diterima pengguna
    warnCount: { type: Number, default: 0 },

    // Alasan peringatan
    reason: [{ type: String }], // Opsional: simpan riwayat alasan

    // Tanggal peringatan terakhir diberikan
    lastWarnDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warning', warningSchema);
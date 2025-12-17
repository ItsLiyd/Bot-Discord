const mongoose = require('mongoose');

// Definisikan Skema Reminder
const reminderSchema = new mongoose.Schema({
    // ID pengguna yang mengatur pengingat (untuk DM)
    userId: {
        type: String,
        required: true,
    },
    // ID channel tempat perintah /reminder digunakan (untuk notifikasi di channel)
    channelId: {
        type: String,
        required: true,
    },
    // ID server tempat pengingat diatur
    guildId: {
        type: String,
        required: true,
    },
    // Pesan pengingat yang akan ditampilkan
    message: {
        type: String,
        required: true,
    },
    // Waktu target kapan pengingat harus dibunyikan
    targetTime: {
        type: Date,
        required: true,
        index: true, // Indexing untuk pencarian cepat oleh scheduler
    },
    // Status untuk melacak apakah pengingat sudah dikirim
    isSent: {
        type: Boolean,
        default: false,
    },
    // Waktu kapan pengingat ini dibuat
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Ekspor Model Mongoose
module.exports = mongoose.model('Reminder', reminderSchema);
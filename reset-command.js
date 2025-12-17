// reset-commands.js

const dotenv = require('dotenv');
dotenv.config(); // WAJIB: Memuat variabel lingkungan dari .env

const { REST, Routes } = require('discord.js');

// --- 1. Konfigurasi (Ambil ID dari .env) ---
const clientId = process.env.DISCORD_CLIENT_ID;
// PERHATIAN: HANYA HAPUS COMMANDS PADA SERVER INI!
const guildId = process.env.DISCORD_GUILD_ID; 
const token = process.env.DISCORD_TOKEN;

if (!clientId || !guildId || !token) {
    console.error("❌ ERROR: Pastikan DISCORD_CLIENT_ID, DISCORD_GUILD_ID, dan DISCORD_TOKEN terisi di file .env.");
    process.exit(1);
}

// --- 2. Fungsi Penghapusan ke Discord API ---

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`\n ⚠️ MULAI PROSES PENGHAPUSAN: Menghapus semua commands dari server ${guildId}...`);

        // Menghapus semua commands yang terdaftar di server ini.
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [] }, // Mengirim array kosong (body: []) akan menghapus semua commands yang ada.
        );

        console.log(`✅ SUKSES! Semua commands slash (/) di server ${guildId} telah dihapus/direset ulang.`);
        console.log('Sekarang, silakan jalankan: node deploy-commands.js');

    } catch (error) {
        console.error('❌ GAGAL MENGHAPUS COMMANDS:', error);
    }
})();
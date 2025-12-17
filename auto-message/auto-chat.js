const cron = require('node-cron');

module.exports = (client) => {
    // Ambil Channel ID dan Timezone dari .env
    const channelId = process.env.CHAT_CHANNEL_ID; 
    const timezone = process.env.CRON_TIMEZONE || "Asia/Jakarta"; 
    
    // --- AMBIL PESAN LANGSUNG DARI KODE DI SINI ---
    const messageContent = 'hai gusy'; // <--- PESAN DIATUR LANGSUNG DI FILE INI
    // ---------------------------------------------

    // ┌─────────────── menit (0 - 59)
    // │ ┌───────────── jam (0 - 23)
    // │ │ ┌─────────── hari dalam sebulan (1 - 31)
    // │ │ │ ┌───────── bulan (1 - 12)
    // │ │ │ │ ┌─────── hari dalam seminggu (0 - 6, di mana 0 adalah Minggu)
    // │ │ │ │ │
    // * * * * *

    cron.schedule('* * * * *', async () => { // Ganti dengan jadwal yang diinginkan
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                channel.send(messageContent); 
                console.log('Pesan otomatis berhasil dikirim.');
            } else {
                console.error('Channel ga ditemuin njir 😹.');
            }
        } catch (error) {
            console.error('woi njer, ada kesalahan tuh 😁:', error);
        }
    }, {
        timezone: timezone 
    });
};
// Delete data para member yg udah kena ban...
// buat bersih - bersihin database biar rapi :v
// Prefix kustom, bisa lu ganti sesuka hati

const Warning = require('../models/warning'); // Pastikan path model bener

module.exports = async (message, client) => {

    // Prefix kustom rahasia lu
    const PREFIX = 'tb!deletedblog'; 

    // Cek apakah pesan diawali prefix, kalau enggak langsung keluar biar kaga error
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Command: tb!deldb clearban
    if (command === 'clearban') {
        // Cek apakah yang ngetik adalah Owner
        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply('❌ Command rahasia ini cuma buat Owner bg!');
        }

        const statusMsg = await message.channel.send('⏳ Sedang memproses pembersihan database...');
        
        try {
            // 1. Ambil semua data warn dari database
            const allWarns = await Warning.find({ guildId: message.guild.id });
            let deletedCount = 0;

            for (const data of allWarns) {
                try {
                    // Cek apakah user masih ada di server
                    const member = await message.guild.members.fetch(data.userId).catch(() => null);
                    
                    // Jika member sudah tidak ada (di-ban atau left)
                    if (!member) {
                        await Warning.deleteOne({ _id: data._id });
                        deletedCount++;
                    }
                } catch (err) {
                    console.error(`Gagal cek user ${data.userId}:`, err);
                }
            }

            return statusMsg.edit(`✅ **Database Cleaned!**\n> Berhasil menghapus \`${deletedCount}\` data sampah dari member yang sudah tidak ada di server.`);
            
        } catch (error) {
            console.error(error);
            return statusMsg.edit('❌ Terjadi kesalahan saat cleaning DB.');
        }
    }
};
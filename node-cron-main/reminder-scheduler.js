const cron = require('node-cron');
const Reminder = require('../models/reminder'); // Pastikan path ini benar!
const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    // Jalankan tugas setiap menit
    // Format cron: menit jam hari_bulan bulan hari_minggu
    cron.schedule('* * * * *', async () => {
        
        const now = new Date();

        try {
            // 1. Cari semua pengingat yang waktunya sudah tiba DAN belum dikirim
            const dueReminders = await Reminder.find({
                targetTime: { $lte: now },
                isSent: false
            });

            if (dueReminders.length === 0) {
                return;
            }

            console.log(`[CRON] Menemukan ${dueReminders.length} pengingat yang jatuh tempo.`);

            // 2. Proses setiap pengingat
            for (const reminder of dueReminders) {
                
                const reminderEmbed = new EmbedBuilder()
                    .setColor('#f1c40f')
                    .setTitle('🔔 ALARM PENGINGAT!')
                    .setDescription(`**Pesan:** ${reminder.message}`)
                    .setTimestamp(reminder.targetTime)
                    .setFooter({ text: 'Pengingat otomatis dari bot.' });
                    
                // --- A. KIRIM KE DM PENGGUNA ---
                try {
                    const user = await client.users.fetch(reminder.userId);
                    await user.send({ 
                        content: `Hai <@${reminder.userId}>, ini pengingatmu:`, 
                        embeds: [reminderEmbed] 
                    });
                    console.log(`-> Pengingat berhasil dikirim ke DM ${user.tag}.`);
                } catch (error) {
                    // Ini bisa terjadi jika DM diblokir
                    console.error(`-> Gagal mengirim DM ke user ${reminder.userId}:`, error.message);
                }
                
                // --- B. KIRIM KE CHANNEL ASAL ---
                try {
                    const channel = await client.channels.fetch(reminder.channelId);
                    if (channel) {
                        await channel.send({
                            content: `⏰ <@${reminder.userId}>, pengingatmu sudah tiba!`,
                            embeds: [reminderEmbed]
                        });
                        console.log(`-> Pengingat berhasil dikirim ke channel ${channel.name}.`);
                    }
                } catch (error) {
                    console.error(`-> Gagal mengirim pesan ke channel ${reminder.channelId}:`, error.message);
                }

                // --- C. TANDAI SUDAH DIKIRIM (UPDATE DB) ---
                await Reminder.updateOne({ _id: reminder._id }, { isSent: true });
            }

        } catch (error) {
            console.error('❌ Terjadi kesalahan pada Reminder Cron Job:', error);
        }
    });

    console.log('✅ Reminder Cron Job (Scheduler) telah diaktifkan.');
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk-list')
        .setDescription('Menampilkan daftar orang AFK'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const afkList = [];
        const now = Date.now();
        let count = 0;

        // Ambil data AFK dari Collection global
        const afkUsersCollection = interaction.client.afkUsers;
        
        // 1. Filter dan Iterasi seluruh data AFK yang hanya milik server ini
        for (const [key, afkData] of afkUsersCollection.entries()) {
            // Key format: "guildId-userId"
            
            // Cek apakah key dimulai dengan ID server saat ini
            if (key.startsWith(`${guildId}-`)) {
                // Ambil User ID dari key
                const userId = key.split('-')[1]; 
                
                // Coba ambil member guild. Jika gagal (member sudah keluar), kita skip.
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                
                if (member) {
                    count++;
                    
                    // --- Hitung Durasi AFK ---
                    const durationMs = now - afkData.timestamp; // Menggunakan 'timestamp' sesuai struktur afk.js kamu
                    const seconds = Math.floor(durationMs / 1000);
                    const days = Math.floor(seconds / (3600 * 24));
                    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);

                    let timeString = '';
                    if (days > 0) timeString += `${days} hari, `;
                    if (hours > 0) timeString += `${hours} jam, `;
                    if (minutes > 0) timeString += `${minutes} menit`;
                    
                    // Bersihkan string durasi
                    timeString = timeString.replace(/, $/, '');
                    if (!timeString) timeString = 'baru saja';
                    
                    // --- Kumpulkan Data ---
                    afkList.push(
                        `**${member.displayName}** (<@${userId}>)` +
                        `\n> **Alasan:** ${afkData.reason || '*Tanpa Alasan*'}` +
                        `\n> **Durasi:** ${timeString}`
                    );
                }
            }
        }
        
        // 2. Cek Hasil dan Kirim Respons
        if (count === 0) {
            return interaction.reply({ 
                content: 'Ga ada orang AFK bwanhg :v', 
                ephemeral: true 
            });
        }

        // Buat Embed
        const embed = new EmbedBuilder()
            .setColor(0x00A0FF) // Warna Biru
            .setTitle(`🚶 Daftar ${count} Pengguna yang Sedang AFK`)
            .setDescription(afkList.join('\n\n'))
            .setTimestamp()
            .setFooter({ text: `TawBot AFK System` });

        await interaction.reply({ embeds: [embed] });
    },
};
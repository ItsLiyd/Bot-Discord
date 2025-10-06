const { EmbedBuilder } = require('discord.js');

// Export function yang akan dipanggil di index.js
module.exports = (client) => {
    // Listener untuk event ketika member baru bergabung ke server
    client.on('guildMemberAdd', async member => {
        
        const welcomeChannelId = 'CHANNEL_ID_LU'; // Ganti dengan ID channel selamat datang
        const rulesChannelId = 'CHANNEL_BUAT_RULES_MU';     // Ganti dengan ID channel peraturan
        const bannerImageUrl = 'URL_GAMBAR';   // Ganti dengan URL gambar banner kamu
        const devUsername = 'NAMA_DEVOLOPER_BOT';  // Ganti dengan username developer bot

        const channel = member.guild.channels.cache.get(welcomeChannelId);

        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#FF0000') // warna merah
            .setTitle('NEW MEMBER') // title buat pesan embed lu 
            .setDescription(
            `Welcome <@${member.user.id}> to **${member.guild.name}**!` +
            `\nJangan lupa patuhi <#${rulesChannelId}> agar kamu tidak kena masalah 👍`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setImage(bannerImageUrl)
            .setFooter({ text: `made with love by [${devUsername}] • Today at ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}` })
            .setTimestamp();

        // Kirim pesan selamat datang
        channel.send({ 
            embeds: [welcomeEmbed] 
        }).catch(err => console.error('Gagal mengirim welcome:', err));
    });

};

const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    //event pas member baru gabung ke server
    client.on('guildMemberAdd', async member => {

        // --- MENGAMBIL DARI PROCESS.ENV ---
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        const rulesChannelId = process.env.RULES_CHANNEL_ID;
        const bannerImageUrl = process.env.WELCOME_BANNER_URL;
        const devUsername = process.env.DEVELOPER_USERNAME;
        // ---------------------------------

        const channel = member.guild.channels.cache.get(welcomeChannelId);

        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('NEW MEMBER 📢')
            .setDescription(
                `Welcome <@${member.user.id}> to **${member.guild.name}**!` +
                `\nJangan lupa patuhi <#${rulesChannelId}> agar kamu tidak kena masalah 👍`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setImage(bannerImageUrl)
            .setFooter({ text: `made with love by [${devUsername}] • Today at ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` })
            .setTimestamp();

        // Kirim pesan selamat datang
        channel.send({
            embeds: [welcomeEmbed]
        }).catch(err => console.error('Gagal mengirim welcome:', err));
    });
};
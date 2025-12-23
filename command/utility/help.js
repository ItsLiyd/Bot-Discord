const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan daftar perintah bot dengan dekorasi lengkap'),

    async execute(interaction) {
        // Ambil banner bot secara otomatis
        const botUser = await interaction.client.users.fetch(interaction.client.user.id, { force: true });
        const bannerBot = botUser.bannerURL({ size: 1024, dynamic: true });

        // Fungsi pencari ID command agar teksnya biru (mentions)
        const getCmd = (name) => {
            const cmd = interaction.client.application.commands.cache.find(c => c.name === name);
            return cmd ? `</${cmd.name}:${cmd.id}>` : `\`/${name}\``;
        };

        const helpEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('━━ 🏮 TAWBOT MENU 🏮 ━━')
            .setThumbnail('https://media.tenor.com/hmYVvHn6-McAAAAi/genshin-impact-hu-tao.gif')
            .setDescription(
                `Halo **${interaction.user.username}**! 👋\n` +
                `Berikut adalah daftar perintah yang tersedia di **TawBot v2.4**.\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
            )
            .addFields( 
                { 
                    name: '🚀 **UTILITY FEATURES**', 
                    value: `>>> ${getCmd('ping')} — *Cek latensi koneksi*\n${getCmd('afk')} — *Setel status AFK*\n${getCmd('afk-list')} — *Daftar user yang AFK*\n${getCmd('reminder set')} — *Atur pengingat/alarm*\n${getCmd('reminder cancel')} — *Batalkan semua pengingat*`,
                    inline: false 
                },
                { 
                    name: 'ℹ️ **INFORMATION**', 
                    value: `>>> ${getCmd('user-info')} — *Lihat profil lengkap*\n${getCmd('server-stats')} — *Data statistik server*\n${getCmd('role-info')} — *Detail informasi role*`,
                    inline: false 
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '💡 *Gunakan slash command ( / ) untuk menjalankan perintah di atas!*',
                    inline: false
                }
            )
            .setImage(bannerBot) 
            .setTimestamp()
            .setFooter({ 
                text: `Request oleh ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
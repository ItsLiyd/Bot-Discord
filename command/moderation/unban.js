const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('unban member')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('ID user yang mau di-unban (kalo mw tag pake logika njir, dia ga disini)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('alasan unban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'Sudah dimaafkan ygy';

        try {
            // Cek dulu apakah user ini beneran ada di daftar ban
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return interaction.reply({ 
                    content: `User dengan ID \`${userId}\` gak ada di daftar blacklist server ini bg.`, 
                    ephemeral: true 
                });
            }

            // Proses Unban
            await interaction.guild.members.unban(userId, reason);

            const embed = new EmbedBuilder()
                .setTitle('🔓 UNBAN SUCCESS - TAWBOT')
                .setColor('#3498db') // Biru Cerah
                .setThumbnail(bannedUser.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`\n`)
                .addFields(
                    { name: '👤 Member', value: `> ${bannedUser.user.tag}\n> (\`${userId}\`)`, inline: false },
                    { name: '📝 reason', value: `\`${reason}\`` }
                )
                .setFooter({ text: `Eksekutor: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({ 
                content: `Gagal unban bg: \`${err.message}\`. Pastikan ID bener ya!`, 
                ephemeral: true 
            });
        }
    },
};
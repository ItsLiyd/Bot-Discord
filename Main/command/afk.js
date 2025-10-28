const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Ngubah lu jadi AFK')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Alasan kenapa lu afk')
                .setRequired(false)),
    
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'tydack ada alasan spesifik';
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Simpan data AFK
        const afkData = {
            reason: reason,
            timestamp: Date.now(),
            originalNickname: interaction.member.nickname || interaction.user.username
        };

        // Simpan ke storage (gunakan database di production)
        const afkKey = `${guildId}-${userId}`; 
        interaction.client.afkUsers.set(afkKey, afkData);

        // Ubah nickname untuk menandakan AFK
        try {
            const newNickname = `[AFK] ${interaction.member.nickname || interaction.user.username}`.substring(0, 32);
            await interaction.member.setNickname(newNickname);
        } catch (error) {
            console.log('ini gimana bg, kaga bisa ubah nama?');
        }

        await interaction.reply({
            content: `>> **Lu sekarang sudah afk!**\n>> **Alasan:** ${reason}`,
            ephemeral: false
        });
    },
};

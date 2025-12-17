const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('nampilin avatar user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Pilih orangnya bg, kalo ga pilih berarti lu')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 512 });

        // Buat tombol untuk download avatar
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Download Avatar')
                    .setStyle(ButtonStyle.Link)
                    .setURL(avatarURL)
            );

        const avatarEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(`🖼️ Avatar ${user.username}`)
            .setImage(avatarURL)
            .setTimestamp()
            .setFooter({
                text: `Diminta oleh ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ 
            embeds: [avatarEmbed],
            components: [row] 
        });
    },
};
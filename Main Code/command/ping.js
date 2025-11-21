const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Menampilkan latensi Bot'),
    
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });

    const pingEmbed = new EmbedBuilder()
      .setColor(0xff0000) // Anda bisa mengganti kode warna ini
      .setTitle('# Pong!')
      .setThumbnail('https://i.supaimg.com/3dbdbad8-3183-4c8e-86ef-8bbb7d0de7cb.png')
      .addFields(
        { name: '🔴 **Cluster**:', value: `${sent.createdTimestamp - interaction.createdTimestamp}ms (avg)`, inline: false},
        { name: '🔴 **Shard**:', value: `${interaction.client.ws.ping}ms`, inline: false},
      )

    await interaction.editReply({ content: ' ', embeds: [pingEmbed] });
  },
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server-stats')
    .setDescription('Menampilkan informasi tentang server ini.'),

  async execute(interaction) {
    const { guild } = interaction;

    // Pastikan bot memiliki cache anggota yang terbaru
    await guild.members.fetch();

    // Hitung statistik anggota
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const idleMembers = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
    const dndMembers = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
    const offlineMembers = guild.members.cache.filter(m => m.presence?.status === 'offline').size;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const userCount = totalMembers - botCount;

    const embed = new EmbedBuilder()
      .setColor('#ff0000') // Merah
      .setTitle(`**<=====× About ${guild.name} ×=====>**`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: '<=================================>',
          value: `\n**👑 Pemilik :** <@${guild.ownerId}>\n**🗺️ ID Server :** ${guild.id}\n**⏱️ Dibuat pada :** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n`,
          inline: false,
        },
        {
          name: '<=================================>',
          value: `\n**🗣️ Total:** ${totalMembers}\n**👤 Pengguna:** ${userCount}\n**🤖 Bot:** ${botCount}\n`,
          inline: false,
        },
        {
          name: '<=================================>',
          value: `\n**🟢 Online :** ${onlineMembers}\n**🌙 Idle :** ${idleMembers}\n**⛔ DND:** ${dndMembers}\n`,
          inline: false,
        },
        {
          name: '<=================================>',
          value: `\n**📺 Channel:** ${guild.channels.cache.size}\n**🛠️ Role:** ${guild.roles.cache.size}\n`,
          inline: false,
        }
      )
      .setFooter({ text: 'Bot comand developed by Pesatir_Handal' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
}; 
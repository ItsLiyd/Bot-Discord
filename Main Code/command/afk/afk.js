const { SlashCommandBuilder } = require('discord.js');
// sesuaikan path jika models/afkUser ada di tempat lain
const AfkUser = require('../../models/afkUser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Ngubah lu jadi AFK')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Alasan kenapa lu afk')
        .setRequired(false)),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: 'Perintah ini hanya bisa dipakai di server.', ephemeral: true });
    }

    // DEBUG LOGS: tampilkan opsi yang dikirim ke bot
    try {
      console.log('=== /afk invoked ===');
      console.log('User:', interaction.user.tag, interaction.user.id);
      console.log('Guild:', interaction.guild.id, interaction.guild.name);
      // options.data berisi array opsi yang dikirim (name, type, value)
      console.log('interaction.options.data:', JSON.stringify(interaction.options.data));
      console.log("interaction.options.getString('reason'):", interaction.options.getString('reason'));
    } catch (logErr) {
      console.error('Error saat logging interaction options:', logErr);
    }

    // Ambil reason jika ada
    const rawReason = interaction.options.getString('reason');
    const reason = rawReason || 'nih user ga punya alasan njir 😹';
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const afkData = {
      guildId,
      userId,
      reason,
      timestamp: Date.now(),
      originalNickname: interaction.member?.nickname || interaction.user.username
    };

    try {
      // simpan ke MongoDB
      await AfkUser.findOneAndUpdate(
        { guildId, userId },
        { $set: afkData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // update cache lokal supaya fitur mention & messageCreate langsung jalan
      interaction.client.afkUsers.set(`${guildId}-${userId}`, {
        reason: afkData.reason,
        timestamp: afkData.timestamp,
        originalNickname: afkData.originalNickname
      });
    } catch (err) {
      console.error('Gagal simpan AFK ke DB:', err);
      interaction.client.afkUsers.set(`${guildId}-${userId}`, {
        reason: afkData.reason,
        timestamp: afkData.timestamp,
        originalNickname: afkData.originalNickname
      });
    }

    // ubah nickname jadi "[AFK] <nama>"
    try {
      const baseName = interaction.member?.nickname || interaction.user.username;
      const newNickname = `[AFK] ${baseName}`.substring(0, 32);
      if (interaction.member && interaction.guild.members.me.permissions.has('ManageNicknames')) {
        await interaction.member.setNickname(newNickname);
      } else if (interaction.member) {
        // coba setNickname tapi kalau error engga crash ato apalah itu sebutannya 
        await interaction.member.setNickname(newNickname).catch(() => null);
      }
    } catch (error) {
      // pesan permision error
      console.log('Gagal ubah nickname (ga punya permision gw woilah 😹):', error?.message || error);
    }

    await interaction.reply({
      content: `**Sekarang sekarang sudah afk!**\n**Alasan:** ${reason}`,
      ephemeral: false // biar semua orang liat
    });
  },
};

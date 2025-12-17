const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

let AfkUser = null;
try {
  AfkUser = require('../../models/afkUser');
} catch (err) {
  AfkUser = null;
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days) parts.push(`${days} hari`);
  if (hours) parts.push(`${hours} jam`);
  if (minutes) parts.push(`${minutes} menit`);
  if (parts.length === 0) return 'baru saja';
  return parts.join(', ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk-list')
    .setDescription('nampilinn daftar orang AFK'),

  async execute(interaction) {
    if (!interaction.guild) return interaction.reply({ content: 'Perintah hanya bisa dipakai di server.', ephemeral: true });

    // Defer reply supaya tidak kena timeout saat ambil data atau fetch member
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    const now = Date.now();
    const lines = [];
    let count = 0;

    try {
      if (AfkUser) {
        // Ambil dari MongoDB, urutkan terbaru dulu. Batasi hasil untuk keamanan embed.
        const MAX_USERS = 10; // adjust sesuai kebutuhan; tambahkan pagination kalau perlu
        const docs = await AfkUser.find({ guildId })
          .sort({ timestamp: -1 })
          .limit(MAX_USERS)
          .lean()
          .exec();

        // Fetch semua member secara paralel namun aman (Promise.allSettled)
        const fetchPromises = docs.map(d => interaction.guild.members.fetch(d.userId).catch(() => null));
        const fetched = await Promise.allSettled(fetchPromises);

        for (let i = 0; i < docs.length; i++) {
          const d = docs[i];
          const res = fetched[i];
          const member = res && res.status === 'fulfilled' ? res.value : null;
          const name = member ? member.displayName : `<@${d.userId}>`;
          const dur = formatDuration(now - (d.timestamp || now));
          const reason = d.reason || '*Tanpa Alasan*';
          lines.push(`**${name}** (<@${d.userId}>)\n> **Alasan:** ${reason}\n> **Durasi:** ${dur}`);
          count++;
        }

        // If there were more entries than MAX_USERS, indicate it
        if ((await AfkUser.countDocuments({ guildId }).exec()) > MAX_USERS) {
          lines.push(`\n...dan masih ada lebih banyak pengguna AFK (ditampilkan ${MAX_USERS} pertama). Gunakan pagination bila perlu.`);
        }
      } else {
        // Fallback ke cache lama jika model tidak tersedia
        const afkUsersCollection = interaction.client.afkUsers;
        // Collect matching keys first, then limit (to avoid iterating huge cache)
        const matches = [];
        for (const [key, afkData] of afkUsersCollection.entries()) {
          if (!key.startsWith(`${guildId}-`)) continue;
          matches.push({ key, afkData });
        }

        // Optional: sort by timestamp desc
        matches.sort((a, b) => (b.afkData.timestamp || 0) - (a.afkData.timestamp || 0));
        const MAX_USERS = 100;
        const sliced = matches.slice(0, MAX_USERS);

        const fetchPromises = sliced.map(item => {
          const userId = item.key.split('-')[1];
          return interaction.guild.members.fetch(userId).catch(() => null);
        });
        const fetched = await Promise.allSettled(fetchPromises);

        for (let i = 0; i < sliced.length; i++) {
          const userId = sliced[i].key.split('-')[1];
          const afkData = sliced[i].afkData;
          const res = fetched[i];
          const member = res && res.status === 'fulfilled' ? res.value : null;
          if (!member) continue;
          const name = member.displayName;
          const dur = formatDuration(now - (afkData.timestamp || now));
          const reason = afkData.reason || '*Tanpa Alasan*';
          lines.push(`**${name}** (<@${userId}>)\n> **Alasan:** ${reason}\n> **Durasi:** ${dur}`);
          count++;
        }
      }
    } catch (err) {
      console.error('Gagal ambil daftar AFK:', err);
      return interaction.editReply({ content: 'Gagal ambil daftar AFK (error).', ephemeral: true });
    }

    if (count === 0) {
      return interaction.editReply({ content: 'Ga ada orang AFK bwanhg :v', ephemeral: true });
    }

    const description = lines.join('\n\n');

    // Proteksi panjang embed (Discord limit ~4096 for description). Kita safe-cut jika terlalu panjang.
    const MAX_DESC = 3900;
    let finalDescription = description;
    if (finalDescription.length > MAX_DESC) {
      finalDescription = finalDescription.slice(0, MAX_DESC) + '\n\n...dan masih ada lagi';
    }

    const embed = new EmbedBuilder()
      .setColor(0xFF0000) // warna merah
      .setTitle(`🚶 Daftar ${count} Pengguna yang Sedang AFK`)
      .setDescription(finalDescription)
      .setTimestamp()
      .setFooter({ text: 'AFK System' });

    await interaction.editReply({ embeds: [embed] });
  },
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('nampilin latensi bot'),

  async execute(interaction) {
    // Berikan balasan awal agar interaction tidak timeout
    const sent = await interaction.reply({ content: '⚡ Menghitung latensi...', fetchReply: true, ephemeral: false });

    // Hitung angka latensi
    const latensiWS = interaction.client.ws.ping;
    const latensiAPI = sent.createdTimestamp - interaction.createdTimestamp;

    // Tentukan emoji dan warna berdasarkan kecepatan (Indikator Status)
    let statusWarna = '#2ecc71'; // Hijau (Cepat)
    let statusEmoji = '🟢 Sangat Cepat';

    if (latensiWS > 200) {
      statusWarna = '#f1c40f'; // Kuning (Sedang) 
      statusEmoji = '🟡 Sedang';
    } else if (latensiWS > 500) {
      statusWarna = '#e74c3c'; // Merah (Lag)
      statusEmoji = '🔴 Lambat';
    }

    // Hitung Uptime Bot (Opsional tapi keren)
    const totalDetik = (interaction.client.uptime / 1000);
    const hari = Math.floor(totalDetik / 86400);
    const jam = Math.floor(totalDetik / 3600) % 24;
    const menit = Math.floor(totalDetik / 60) % 60;
    const uptimeString = `${hari}h ${jam}j ${menit}m`;

    const pingEmbed = new EmbedBuilder()
      .setColor(statusWarna)
      .setTitle('🏓 Pong!')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        { 
            name: '📡 Koneksi WebSocket', 
            value: `\`\`\`${latensiWS}ms\`\`\``, 
            inline: true 
        },
        { 
            name: '🚀 Respon API', 
            value: `\`\`\`${latensiAPI}ms\`\`\``, 
            inline: true 
        },
        { 
            name: '📊 Status Server', 
            value: `${statusEmoji}`, 
            inline: true 
        },
        { 
            name: '⏱️ Bot Online Sejak', 
            value: `\`${uptimeString}\``, 
            inline: false 
        }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.username}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();

    await interaction.editReply({ content: '', embeds: [pingEmbed] });
  },
};
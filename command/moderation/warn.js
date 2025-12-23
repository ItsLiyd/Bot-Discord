const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warning = require('../../models/warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Memberikan peringatan keras kepada member 😈')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('Siapa yang mau kena mental?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Alasan warn')
                .setRequired(false))
        // KUNCI: Cuma Administrator yang bisa lihat/pakai command ini
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const target = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan spesfifik. Personal banget parah... :v';
        const guildId = interaction.guild.id;
        const userId = target.id;

        if (!target) return interaction.reply({ content: "saha itu njir", ephemeral: true });
        if (target.user.bot) return interaction.reply({ content: "bot salah apa bg :v", ephemeral: true });
        
        // Cek hirarki (biar bot gak error pas mau hukum yang rolenya lebih tinggi/sama)
        if (!target.manageable) {
            return interaction.reply({ content: "Gak bisa hukum orang ini bg, dia lebih sakti dari botnya!", ephemeral: true });
        }

        // Tambahkan pengecekan ini di bawah 'const userId = target.id;'
        if (target.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ 
        content: "❌ dia kebal hukum walaupun dia bukan oknum", 
        ephemeral: true 
    });
}

        if (!target.manageable) {
          return interaction.reply({ 
        content: "❌ Bot gak punya kuasa buat hukum orang ini (hirarki role atau dia Admin)!", 
        ephemeral: true 
    });
}

        // Update data di MongoDB
        let warnData = await Warning.findOneAndUpdate(
            { guildId, userId },
            { $inc: { warnCount: 1 }, $push: { reason: reason } },
            { upsert: true, new: true }
        );

        const count = warnData.warnCount;

        // --- ⚠️ WAJIB ISI ID ROLE LU DI SINI ⚠️ ---
        const WARN_ROLES = {
            1: 'ID_ROLE_WARNING_1_HERE', 
            2: 'ID_ROLE_WARNING_2_HERE',
            3: 'ID_ROLE_WARNING_3_HERE'
        };

        // --- KONFIGURASI WAKTU ---
        const TIME = {
            DAY: 24 * 60 * 60 * 1000,
            WEEK: 7 * 24 * 60 * 60 * 1000,
            MONTH: 28 * 24 * 60 * 60 * 1000 // Limit maksimal Discord
        };

        let actionTaken = '';
        let color = '#f1c40f'; // Default Kuning

        try {
            if (count <= 3) {
                actionTaken = '📩 **Peringatan Ringan**: Dikirim via DM';
                await target.send(`⚠️ **WARN ${count}/3**\nLu kena tegur di **${interaction.guild.name}**\n**Alasan:** \`${reason}\`\n*Dosa lu dicatat ya!*`).catch(() => {
                    actionTaken = '📩 **Peringatan Ringan**: (DM User Tertutup)';
                });

            } else if (count === 4) {
                actionTaken = '🚫 **WARNING 1**: Timeout 1 Hari';
                await target.roles.add(WARN_ROLES[1]);
                await target.timeout(TIME.DAY, reason);
                color = '#e67e22'; // Oranye

            } else if (count === 5) {
                actionTaken = '🚫 **WARNING 2**: Timeout 1 Minggu';
                await target.roles.add(WARN_ROLES[2]);
                await target.timeout(TIME.WEEK, reason);
                color = '#d35400'; // Oranye Tua

            } else if (count === 6) {
                actionTaken = '🚫 **WARNING 3**: Timeout 1 Bulan';
                await target.roles.add(WARN_ROLES[3]);
                await target.timeout(TIME.MONTH, reason);
                color = '#c0392b'; // Merah

            } else {
                actionTaken = '🔨 **BANNED PERMANEN**: Sayonara!';
                color = '#000000'; // Hitam
                await target.ban({ reason: `Akumulasi dosa ke-${count}: ${reason}` });
            }

            // TAMPILAN ESTETIK
            const embed = new EmbedBuilder()
                .setTitle('⚖️ LOG MODERASI - TAWBOT')
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setColor(color)
                .setDescription(`\n`)
                .addFields(
                    { name: '👤 Terdakwa', value: `> ${target.user.tag}\n> (\`${target.id}\`)`, inline: false },
                    { name: '📊 Status', value: `\`Peringatan ke-${count}\``, inline: true },
                    { name: '📝 Alasan', value: `\`${reason}\``, inline: true },
                    { name: '\n', value: '\n' },
                    { name: '⚡ Hukuman', value: actionTaken }
                )
                .setFooter({ text: `Eksekutor: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({ content: `Gagal eksekusi bg: \`${err.message}\``, ephemeral: true });
        }
    },
};
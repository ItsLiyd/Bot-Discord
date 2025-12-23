const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warning = require('../../models/warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('ngurangin poin warn member yang sudah tobat ✨')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('pilih membernya bg')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('poin')
                .setDescription('kurangin berapa bg?')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const target = interaction.options.getMember('member');
        const amount = interaction.options.getInteger('poin') || 1;
        const guildId = interaction.guild.id;
        const userId = target.id;

        if (!target) return interaction.reply({ content: "member ghoib njir", ephemeral: true });

        // Cari data warn di DB
        let warnData = await Warning.findOne({ guildId, userId });

        if (!warnData || warnData.warnCount === 0) {
            return interaction.reply({ content: "orang bersih ini bg, antara bersih beneran atau udah dibersihin....", ephemeral: true });
        }

        const oldRef = warnData.warnCount;
        // Pake Math.max biar minimal 0, gak bisa minus
        warnData.warnCount = Math.max(0, warnData.warnCount - amount);
        await warnData.save();

        const newCount = warnData.warnCount;

        // --- ✅ ID ROLE SUDAH TERPASANG ---
        const WARN_ROLES = {
            1: 'ID_ROLE_WARNING_1_HERE', 
            2: 'ID_ROLE_WARNING_2_HERE',
            3: 'ID_ROLE_WARNING_3_HERE'
        };

        let rolesRemoved = [];

        try {
            // Logika pencabutan role otomatis berdasarkan sisa poin
            if (newCount < 4 && target.roles.cache.has(WARN_ROLES[1])) {
                await target.roles.remove(WARN_ROLES[1]);
                rolesRemoved.push('WARNING 1');
            }
            if (newCount < 5 && target.roles.cache.has(WARN_ROLES[2])) {
                await target.roles.remove(WARN_ROLES[2]);
                rolesRemoved.push('WARNING 2');
            }
            if (newCount < 6 && target.roles.cache.has(WARN_ROLES[3])) {
                await target.roles.remove(WARN_ROLES[3]);
                rolesRemoved.push('WARNING 3');
            }

            const statusRole = rolesRemoved.length > 0 ? `🧹 Dicabut: \`${rolesRemoved.join(', ')}\`` : '✨ Tidak ada role yang perlu dicabut';

            const embed = new EmbedBuilder()
                .setTitle('✨ PENGAMPUNAN DOSA ✨')
                .setColor('#2ecc71') // Warna hijau estetik
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setDescription('\n')
                .addFields(
                    { name: '👤 Member', value: `> ${target.user.tag}\n> (\`${target.id}\`)`, inline: false },
                    { name: '📉 Pengurangan', value: `\`-${amount} Poin\``, inline: true },
                    { name: '📊 Sisa Warn', value: `\`${newCount} Warn\``, inline: true },
                    { name: '🧹 Update Role', value: statusRole, inline: false }
                )
                .setFooter({ text: `Eksekutor: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({ 
                content: `✅ Poin DB dikurangi, tapi gagal update role: \`${err.message}\` (Cek hirarki role bot!)`, 
                ephemeral: true 
            });
        }
    },
};
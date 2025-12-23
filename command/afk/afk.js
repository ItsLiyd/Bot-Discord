const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AfkUser = require('../../models/afkUser');

// Fungsi pembantu format durasi
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days) parts.push(`${days} hari`);
    if (hours) parts.push(`${hours} jam`);
    if (minutes) parts.push(`${minutes} menit`);
    return parts.length === 0 ? 'baru saja' : parts.join(', ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Sistem manajemen AFK')

        // Sub-command SET
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Ngubah status lu jadi AFK')
                .addStringOption(opt => opt.setName('reason').setDescription('Alasan lu AFK').setRequired(false))
        )
        // Sub-command LIST
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('Nampilin daftar orang yang lagi AFK')
        )
        // Sub-command DEL
        .addSubcommand(sub =>
            sub.setName('del')
                .setDescription('Hapus status AFK lu secara manual')
        ),

    async execute(interaction) {
        if (!interaction.guild) return interaction.reply({ content: 'Main di server aja bg!', ephemeral: true });
        
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // --- LOGIC SET AFK ---
        if (sub === 'set') {
            const reason = interaction.options.getString('reason') || 'tidak ada alasan spesifik';
            const afkData = {
                guildId, userId, reason,
                timestamp: Date.now(),
                originalNickname: interaction.member?.nickname || interaction.user.username
            };

            await AfkUser.findOneAndUpdate({ guildId, userId }, { $set: afkData }, { upsert: true });
            interaction.client.afkUsers.set(`${guildId}-${userId}`, afkData);

            // Ubah Nickname
            try {
                const newNick = `[AFK] ${afkData.originalNickname}`.substring(0, 32);
                if (interaction.member.manageable) await interaction.member.setNickname(newNick);
            } catch (e) { console.log('Gagal ubah nick:', e.message); }

            return interaction.reply({
                content: `<:arrow2:1414259950191906999> **Lu sekarang AFK!**\n> **Alasan:** ${reason}`
            });
        }

        // --- LOGIC LIST AFK ---
        if (sub === 'list') {
            await interaction.deferReply();
            const docs = await AfkUser.find({ guildId }).sort({ timestamp: -1 }).limit(10).lean();
            
            if (!docs.length) return interaction.editReply('Ga ada orang AFK bwanhg :v');

            const lines = docs.map((d, i) => {
                const dur = formatDuration(Date.now() - d.timestamp);
                return `**${i + 1}. <@${d.userId}>**\n> 📝 ${d.reason}\n> ⏳ ${dur}`;
            });

            const embed = new EmbedBuilder()
                .setTitle('🚶 Daftar Pengguna AFK')
                .setColor(0xff0000)
                .setDescription(lines.join('\n\n'))
                .setFooter({ text: 'TawBot AFK System' });

            return interaction.editReply({ embeds: [embed] });
        }

        // --- LOGIC DEL AFK ---
        if (sub === 'del') {
            const data = await AfkUser.findOneAndDelete({ guildId, userId });
            interaction.client.afkUsers.delete(`${guildId}-${userId}`);

            if (!data) return interaction.reply({ content: 'Lu emang lagi gak AFK bg...', ephemeral: true });

            // Balikin Nickname
            try {
                if (interaction.member.manageable) await interaction.member.setNickname(data.originalNickname);
            } catch (e) { console.log('Gagal reset nick:', e.message); }

            return interaction.reply({ content: '✅ Status AFK lu udah dihapus!' });
        }
    },
};
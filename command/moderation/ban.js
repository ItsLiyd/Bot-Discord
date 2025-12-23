const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warning = require('../../models/warning'); // Tambahin ini biar data warn dia ilang pas di ban

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('ban member xialan')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('pilih membernya bg')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('alasan ban')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const target = interaction.options.getMember('member');
        const user = interaction.options.getUser('member'); // Buat backup kalau target udah kaga ada di server
        const reason = interaction.options.getString('reason') || 'pergi kau member "kelamin pria"';
        const guildId = interaction.guild.id;

        // Validasi awal
        if (!target && !user) return interaction.reply({ content: "Membernya ga ketemu bg.", ephemeral: true });
        
        // Cek hirarki kalau target masih ada di server
        if (target && !target.bannable) {
            return interaction.reply({ content: "Gak bisa ban orang ini bg, dia lebih sakti dari bot!", ephemeral: true });
        }

        try {
            // 1. Cek apakah user sudah di-ban
            const banList = await interaction.guild.bans.fetch();
            const isBanned = banList.get(user.id);

            if (isBanned) {
                return interaction.reply({ 
                    content: `User dengan ID \`${user.id}\` emang udah di-ban dari awal bg.`, 
                    ephemeral: true 
                });
            }

            // 2. Hapus data dosanya di MongoDB biar kaga menuh-menuhin DB
            await Warning.deleteOne({ guildId, userId: user.id });

            // 3. Proses Eksekusi Ban
            await interaction.guild.members.ban(user.id, { reason });

            const embed = new EmbedBuilder()
                .setTitle('🔨 BAN SUCCESS - TAWBOT')
                .setColor('#e74c3c') // Merah
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setDescription(`\n`)
                .addFields(
                    { name: '👤 Member', value: `> ${user.tag}\n> (\`${user.id}\`)`, inline: false },
                    { name: '📝 Alasan', value: `\`${reason}\`` }
                )
                .setFooter({ text: `Eksekutor: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({ 
                content: `Gagal ban bg: \`${err.message}\`.`, 
                ephemeral: true 
            });
        }
    },
};
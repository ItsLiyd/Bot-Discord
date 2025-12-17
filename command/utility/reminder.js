const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Reminder = require('../../models/reminder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('buat ngingetin  lu nanti')
        // SUB-COMMAND: SET
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Mengatur pengingat baru')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Isi pesan reminder')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('hour')
                        .setDescription('Jam (0-23 WIB)')
                        .setRequired(true)
                        .setMinValue(0) 
                        .setMaxValue(23))
                .addIntegerOption(option =>
                    option.setName('minute')
                        .setDescription('Menit (0-59) WIB')
                        .setRequired(false)
                        .setMinValue(0)
                        .setMaxValue(59))
        )
        // SUB-COMMAND: CANCEL
        .addSubcommand(subcommand =>
            subcommand
                .setName('cancel')
                .setDescription('hapus semua pengingat')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // --- LOGIKA SET REMINDER ---
        if (sub === 'set') {
            await interaction.deferReply({ ephemeral: true });
            const messageInput = interaction.options.getString('message');
            const hour = interaction.options.getInteger('hour');
            const minute = interaction.options.getInteger('minute') || 0;

            const now = new Date();
            let targetTime = new Date();
            targetTime.setHours(hour, minute, 0, 0);

            if (targetTime <= now) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            const timestamp = Math.floor(targetTime.getTime() / 1000);

            try {
                await Reminder.create({
                    userId: interaction.user.id,
                    channelId: interaction.channelId,
                    guildId: interaction.guildId,
                    message: messageInput,
                    targetTime: targetTime,
                    isSent: false,
                });

                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🔔 Pengingat Diatur!')
                    .setDescription(`**Pesan:** ${messageInput}\n**Waktu:** <t:${timestamp}:F>`)
                    .setFooter({ text: 'Pastikan DM kamu terbuka.' });

                return await interaction.editReply({ embeds: [embed] });
            } catch (e) {
                console.error(e);
                return await interaction.editReply('Gagal simpan ke database bg.');
            }
        }

        // --- LOGIKA CANCEL REMINDER ---
        if (sub === 'cancel') {
            await interaction.deferReply({ ephemeral: true });
            try {
                const result = await Reminder.deleteMany({ 
                    userId: interaction.user.id, 
                    isSent: false 
                });

                if (result.deletedCount === 0) {
                    return interaction.editReply('Lu nggak punya pengingat yang aktif bg.');
                }

                return interaction.editReply(`✅ Berhasil membatalkan **${result.deletedCount}** pengingat lu.`);
            } catch (e) {
                console.error(e);
                return await interaction.editReply('Gagal hapus pengingat.');
            }
        }
    },
};
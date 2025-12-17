const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Reminder = require('../../models/reminder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('buat ngingetin lu nanti')
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
                        .setDescription('Jam (0-23)')
                        .setRequired(true)
                        .setMinValue(0) 
                        .setMaxValue(23))
                .addIntegerOption(option =>
                    option.setName('minute')
                        .setDescription('Menit (0-59)')
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

            // Perbaikan Waktu ke WIB
            const now = new Date();
            // Paksa offset ke +7 jam (WIB)
            const wibOffset = 7 * 60 * 60 * 1000;
            const nowWIB = new Date(now.getTime() + wibOffset);

            let targetTimeWIB = new Date(now.getTime() + wibOffset);
            targetTimeWIB.setHours(hour, minute, 0, 0);

            // Jika jam sudah lewat di hari ini, pindah ke besok
            if (targetTimeWIB <= nowWIB) {
                targetTimeWIB.setDate(targetTimeWIB.getDate() + 1);
            }

            // Kembalikan ke UTC untuk disimpan di DB dan dijadikan timestamp Discord
            const finalTargetTime = new Date(targetTimeWIB.getTime() - wibOffset);
            const timestamp = Math.floor(finalTargetTime.getTime() / 1000);

            try {
                await Reminder.create({
                    userId: interaction.user.id,
                    channelId: interaction.channelId,
                    guildId: interaction.guildId,
                    message: messageInput,
                    targetTime: finalTargetTime,
                    isSent: false,
                });

                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🔔 Pengingat Diatur!')
                    .setDescription(`**Pesan:** ${messageInput}\n**Waktu:** <t:${timestamp}:F>`)
                    .setFooter({ text: 'Zona waktu: Asia/Jakarta (WIB)' });

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
const { SlashCommandBuilder } = require('discord.js');

const MEMBER_ID = process.env.OWNER_ID; 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roamin')
        .setDescription('Mengirim pesan sebagai bot (hanya untuk anggota tertentu)')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Isi pesan yang ingin dikirim bot')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reply_link')
                .setDescription('Link pesan jika ingin membalas (reply) pesan tertentu')
                .setRequired(false)
        ),

    async execute(interaction) {
        // Cek apakah command digunakan di dalam guild
        if (!interaction.inGuild()) {
            return interaction.reply({ content: 'Ga bisa digunain di sini njir 😹', ephemeral: true });
        }

        // Cek ID Pengguna
        if (interaction.user.id !== MEMBER_ID) {
            return interaction.reply({ content: 'Lu ga ada ijin bg 😹', ephemeral: true });
        }

        const text = interaction.options.getString('message');
        const link = interaction.options.getString('reply_link');

        // Gunakan deferReply agar interaksi tidak timeout
        await interaction.deferReply({ ephemeral: true });

        try {
            if (!link) {
                // Kirim pesan biasa ke channel tempat command diketik
                await interaction.channel.send({ content: text });
            } else {
                // Logika membalas pesan berdasarkan Link
                // Contoh link: https://discord.com/channels/GUILD_ID/CHANNEL_ID/MESSAGE_ID
                const parts = link.split('/');
                const messageId = parts[parts.length - 1];
                const channelId = parts[parts.length - 2];

                const channel = await interaction.client.channels.fetch(channelId);
                const targetMessage = await channel.messages.fetch(messageId);

                await targetMessage.reply({ content: text });
            }

            await interaction.editReply({ content: '✅ Pesan berhasil dikirim!' });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Gagal kirim pesan. Pastikan link valid dan bot punya izin di channel tersebut.' });
        }
    },
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('menampilkan daftar command yang tersedia.'),

    async execute(interaction) {
        // Akses Collection client.commands yang berisi semua command yang dimuat
        const commands = interaction.client.commands;
        
        // 1. Cek apakah ada command yang termuat
        if (commands.size === 0) {
            return interaction.reply({
                content: 'kaga ada command tersedia bg, kek nya ada masalah deh.',
                ephemeral: true
            });
        }

        // 2. Buat string daftar command
        const commandList = commands
            // Map setiap command menjadi format string yang diinginkan
            .map(command => {
                // Ambil nama dan deskripsi dari properti 'data'
                const name = command.data.name;
                const description = command.data.description || 'Tidak ada deskripsi.';
                return `**/${name}** - ${description}`;
            })
            // Gabungkan semua string dengan baris baru
            .join('\n');

        // 3. Buat Embed untuk tampilan yang rapi
        const helpEmbed = new EmbedBuilder()
            .setColor(0xFF0000) // Warna Meraj
            .setTitle('📖 Daftar Command TawBot')
            .addFields(
                { 
                    name: 'Commands Tersedia', 
                    value: commandList 
                }
            )
            .setFooter({ text: `Total ${commands.size} command terdaftar.` })
            .setTimestamp();

        // Kirim embed
        await interaction.reply({ 
            embeds: [helpEmbed],
            ephemeral: false // Atau set ke true jika kamu ingin hanya si pengguna yang melihatnya
        });
    },
};
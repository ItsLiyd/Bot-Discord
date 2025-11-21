const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Menampilkan informasi member.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Pilih njir, kalo ga pilih, berarti info lu sendiri')
                .setRequired(false)),

    // execute: fungsi yang dijalankan saat perintah dipanggil
    async execute(interaction) {
        // Mengambil target pengguna dari opsi, jika tidak ada
        const user = interaction.options.getUser('user') || interaction.user;

        // Mengambil data 'member' dari server untuk mendapatkan tanggal bergabung dan roles
        const member = await interaction.guild.members.fetch(user.id);

        // Format roles atau tampilkan "None" jika tidak ada roles
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'None';

        // Get user permissions
        const permissions = member.permissions.toArray();

        // Daftar izin yang dianggap "tinggi" atau penting
        const HIGH_LEVEL_PERMS = [
            'ADMINISTRATOR', 'MANAGE_GUILD', 'KICK_MEMBERS', 'BAN_MEMBERS',
            'MANAGE_ROLES', 'MANAGE_CHANNELS', 'MODERATE_MEMBERS', 'MANAGE_NICKNAMES'
        ];

        let permissionList;

        if (permissions.includes('ADMINISTRATOR')) {
            // Jika user adalah admin, tampilkan satu baris saja
            permissionList = '`ADMINISTRATOR` (Semua Izin)';
        } else {
            // Filter hanya izin yang tinggi
            const filteredPermissions = permissions.filter(perm => HIGH_LEVEL_PERMS.includes(perm));
            const remainingCount = permissions.length - filteredPermissions.length;

            if (filteredPermissions.length > 0) {
                // Tampilkan yang penting, lalu tambahkan "dan X izin lainnya"
                permissionList = filteredPermissions.map(perm => `\`${perm}\``).join(', ');
                if (remainingCount > 0) {
                    permissionList += `\n... dan \`${remainingCount} izin dasar lainnya\``;
                }
            } else {
                // Jika tidak ada izin khusus
                permissionList = 'Izin Dasar Saja';
            }
        }

        // buat embed ini bjerrrrrrr, ngebug mulu bangkev
        const userInfoEmbed = new EmbedBuilder()
            .setColor(member.displayColor || '#ff0000')
            .setTitle(`> About ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                {
                    name: '**Member Info**',
                    value: `**Username:** ${user.username}\n**Display Name:** ${member.displayName}\n**ID:** ${user.id}`,
                    inline: false
                },
                {
                    name: '**Creation**',
                    value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`,
                    inline: false
                },
                {
                    name: '**Join Date**',
                    value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`,
                    inline: false
                },
                {
                    name: '**Permissions**',
                    value: permissionList, // Menggunakan daftar yang sudah disingkat/difilter
                    inline: false
                },
                {
                    name: '**Roles**',
                    value: roles.length > 1024 ? 'Terlalu banyak roles' : roles,
                    inline: false
                }
            )
            .setFooter({
                text: `Di request oleh bg: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        // Membalas interaksi dengan embed yang sudah dibuat
        await interaction.reply({ embeds: [userInfoEmbed] });
    }
};
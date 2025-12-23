const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Menampilkan informasi member.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('kalo ga pilih, berarti info lu sendiri')
                .setRequired(false)),

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

        // Daftar izin yang dianggap "tinggi" atau penting (Casing Sudah Benar: Title Case)
        const HIGH_LEVEL_PERMS = [
            'Administrator', 'ManageGuild', 'KickMembers', 'BanMembers',
            'ManageRoles', 'ManageChannels', 'ModerateMembers', 'ManageNicknames'
        ];

        let permissionList;

        if (permissions.includes('Administrator')) {
            // Jika user adalah admin, tampilkan satu baris saja
            permissionList = '`ADMINISTRATOR` (Semua Izin)'; // Ditampilkan ALL CAPS
        } else {
            // Filter hanya izin yang tinggi
            const filteredPermissions = permissions.filter(perm => HIGH_LEVEL_PERMS.includes(perm));
            const remainingCount = permissions.length - filteredPermissions.length;

            if (filteredPermissions.length > 0) {
                // UBAH KE HURUF KAPITAL SEMUA saat menampilkan output
                permissionList = filteredPermissions.map(perm => `\`${perm.toUpperCase()}\``).join(', ');
                if (remainingCount > 0) {
                    permissionList += `\n... dan \`${remainingCount} izin dasar lainnya\``;
                }
            } else {
                // Jika tidak ada izin khusus
                permissionList = 'Izin Dasar Aja';
            }
        }

        // buat embed ini bjerrrrrrr, ngebug mulu bangkev
        const userInfoEmbed = new EmbedBuilder()
            .setColor(member.displayColor || '#ff0000')
            .setTitle(`> About ${user.username} <:telephone:1269616741613572148>`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024}))
            .addFields(
                {
                    name: '<:user:1414259930747113493> **Member Info**',
                    value: `<:blank:1271074823552110676><:arrow2:1414259950191906999> **Username:** ${user.username}\n<:blank:1271074823552110676><:arrow2:1414259950191906999> **Display Name:** ${member.displayName}\n<:blank:1271074823552110676><:arrow2:1414259950191906999> **ID:** ${user.id}`,
                    inline: false
                },
                {
                    name: '<:calendar:1414260001234567890> **Creation**',
                    value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`,
                    inline: false
                },
                {
                    name: '<:gift:1414259749423157429> **Join Date**',
                    value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`,
                    inline: false
                },
                {
                    name: '<:love:1414259964033241161> **Permissions**',
                    value: permissionList, // Menggunakan daftar yang sudah disingkat/difilter
                    inline: false
                },
                {
                    name: '<:list:1414259914427338865> **Roles**',
                    value: roles.length > 1024 ? 'Terlalu banyak roles 😵‍💫' : roles,
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
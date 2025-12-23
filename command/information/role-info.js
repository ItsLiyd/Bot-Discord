const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role-info')
        .setDescription('Liat ingfo tentang role')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('pilih bjir, gw bukan dukun')
                .setRequired(true)),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        // ... (Kode error handling tetap sama)
        await interaction.deferReply({ ephemeral: false });

        // ... (Logika variabel humanMembers, botMembers, roleColorHex, dll. tetap di sini)
        const membersWithRole = role.members.size;
        const roleColorHex = role.hexColor.toUpperCase() === '#000000' ? 'Tidak Ada Warna' : role.hexColor.toUpperCase();
        // ...
        const humanMembers = role.members.filter(member => !member.user.bot).size;
        const botMembers = role.members.filter(member => member.user.bot).size;
        
        // Dapatkan status Ya/Tidak dengan emoji
        const mentionableStatus = role.mentionable ? '🟢 Ya' : '🔴 Tidak';
        const managedStatus = role.managed ? '🟢 Ya' : '🔴 Tidak';
        const adminStatus = role.permissions.has(PermissionsBitField.Flags.Administrator) ? '✅ Ya' : '❌ Tidak';

        // Terapkan logika Prank Admin
        const PRANK_TARGET_ROLE_ID = '1357283129634590805'; 
        let adminDisplayStatus = adminStatus;
        if (role.id === PRANK_TARGET_ROLE_ID) {
            adminDisplayStatus = 'Ya :v'; 
        }

        // Dapatkan daftar izin (tetap sebagai Field terpisah)
        const permissions = role.permissions.toArray();
        const permissionList = permissions.length > 0 
            ? permissions.map(p => `\`${p}\``).join(', ')
            : '`Tidak ada izin spesifik.`';


        const roleEmbed = new EmbedBuilder()
            .setColor(role.color || '#db3434')
            .setTitle(`📜 Informasi Peran: ${role.name}`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields(

                { 
                    name: '📊 Ringkasan Role', 
                    value: `
                 🆔 **ID:** \`${role.id}\`
                 ✨ **Warna:** \`${roleColorHex}\`
                 ⏰ **Dibuat:** <t:${Math.floor(role.createdTimestamp / 1000)}:R>
                 `
                    , 
                    inline: false // Satu baris penuh
                },

                {name: '', value: '\u200B' , inline: false}, // Field kosong untuk spasi

                { 
                    name: '👥 Anggota', 
                    value: `
                 **Total:** ${membersWithRole}
                 **Manusia:** ${humanMembers}
                 **Bot:** ${botMembers}
                 `
                    , 
                    inline: true 
                },
                { 
                    name: '🛡️ Status & Posisi', 
                    value: `
                 **Admin:** ${adminDisplayStatus}
                 **Mentionable:** ${mentionableStatus}
                 **Managed:** ${managedStatus}
                 **Posisi:** \`${role.position}\`
`
                    , 
                    inline: true 
                },

                 {name: '', value: '\u200B' , inline: false}, // Field kosong untuk spasi

                { 
                    name: '🔑 Daftar Semua Izin', 
                    value: permissionList.substring(0, 1024), 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Diambil di ${interaction.guild.name}`, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            });

        await interaction.editReply({ embeds: [roleEmbed] });
    },
};
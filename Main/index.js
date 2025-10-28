const dotenv = require('dotenv');
dotenv.config();

const { Client, GatewayIntentBits, Collection, Guild } = require('discord.js');
const serverStatsCommand = require('./command/server-stats.js');
const autoReminder = require('./auto-message/auto-reminder.js');
const autoChat = require('./auto-message/auto-chat.js');
const welcomer = require('./auto-message/welcomer.js');

//untoek slash command
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
client.afkUsers = new Collection(); /// Menyimpan data AFK pengguna

// Langkah 2: Tambahkan perintah ke Collection
client.commands.set(serverStatsCommand.data.name, serverStatsCommand);

// Auto message
client.on('ready', () => {
  console.log(`logged in as ${client.user.tag}`);

  // --- KODE STATUS BOT DIMULAI DI SINI ---
  client.user.setPresence({
    activities: [{
      name: 'Kimkir Impact', // Teks aktivitas
      type: 0 // 0 = Playing
    }],
    status: 'idle' // <--- INI PENTING! Mengubah warna menjadi Kuning/Idle
  });
  // --- KODE STATUS BOT SELESAI DI SINI ---

  autoReminder(client);
  autoChat(client);
  welcomer(client);
});

const commandsPath = path.join(__dirname, 'command');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // Setel item baru di Collection dengan kunci nama perintah

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`Perintah ${command.data.name} berhasil dimuat.`);
  } else {
    console.log(`[WARNING] Perintah di ${filePath} tidak memiliki properti "data" atau "execute" yang dibutuhkan.`);
  }
}



// ... (Bagian interactionCreate)

// Langkah 3: Tangani interaksi (perintah slash) dari pengguna
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Ada kesalahan bg saat jalanin perintah :v', ephemeral: false });
  }
});

/// Untuk AFK commands
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const afkInfo = client.afkUsers.get(`${message.guild.id}-${message.author.id}`);

  // Cek apakah user sendiri sedang AFK
  if (afkInfo) {
    client.afkUsers.delete(`${message.guild.id}-${message.author.id}`);
    try {
      await message.member.setNickname(afkInfo.originalNickname);
    } catch (error) {
      console.log('Gagal balikin nickname:', error);
    }
    // Kirim pesan balasan
    const reply = await message.reply('Welkam back! Status AFK luwh udah dihapus. <a:smolhutao:1362644988147798159>');

    // Hapus pesan balasan setelah 10 detik (10000 milidetik)
    setTimeout(() => {
      // Gunakan delete() pada pesan balasan
      reply.delete().catch(err => console.error("Gagal menghapus pesan 'welcome back':", err));
    }, 10000);
  }

  // Cek apakah mention user yang AFK
  message.mentions.users.forEach(user => {
    const afkMentioned = client.afkUsers.get(`${message.guild.id}-${user.id}`);
    if (afkMentioned) {
      message.reply(`<:arrow2:1414259950191906999> **${user.username}** lagi AFK\n<:blank:1271074823552110676> **Alasan:** ${afkMentioned.reason}`);
    }
  });
});


// ----- 💀💀💀 -----
// JANGAN DI SEBAR KEMANA PUN!!!
// --- Blok Kode untuk Perlindungan Role Permanen ---

// GANTI dengan DAFTAR ID PENGGUNA yang ingin dikunci rolenya
const TARGET_USER_IDS = [
  '1267021616429268994',
  '1344093702599217304',
  '1232945430203994124',
];

// GANTI dengan ID ROLE yang ingin dikunci agar tidak bisa dicopot
const TARGET_ROLE_ID = '1418243611618971880';

// Event ini akan dipicu setiap kali anggota server diupdate (termasuk perubahan role)
client.on('guildMemberUpdate', async (oldMember, newMember) => {

  // 1. Cek apakah pengguna yang diupdate ada di dalam daftar TARGET_USER_IDS
  if (!TARGET_USER_IDS.includes(newMember.user.id)) {
    return; // Jika bukan pengguna target, hentikan proses
  }

  // 2. Cek apakah role target ada di oldMember TAPI tidak ada di newMember
  const wasRolePresent = oldMember.roles.cache.has(TARGET_ROLE_ID);
  const isRolePresent = newMember.roles.cache.has(TARGET_ROLE_ID);

  if (wasRolePresent && !isRolePresent) {
    // Logika re-add role jika terdeteksi telah dicopot

    try {
      const role = newMember.guild.roles.cache.get(TARGET_ROLE_ID);

      if (!role) {
        console.error(`[ROLE ERROR] Gagal menemukan role dengan ID: ${TARGET_ROLE_ID}`);
        return;
      }

      // Memasang kembali peran tersebut
      await newMember.roles.add(role, 'Role dipasang kembali secara otomatis (Role Protection).');
      console.log(`[ROLE PROTECTION] Role ${role.name} berhasil dipasang kembali pada ${newMember.user.tag}.`);

    } catch (error) {
      console.error(`[ROLE PROTECTION GAGAL] Gagal memasang kembali role untuk ${newMember.user.tag}:`, error);
      // PENTING: Jika error, pastikan role BOT Anda lebih tinggi dari role TARGET!
    }
  }
});

// ------- 💀💀💀💀💀💀💀 -------

client.login(process.env.DISCORD_TOKEN);
const dotenv = require('dotenv');
dotenv.config();

// --- BARIS TAMBAHAN: Muat Database ---
// ASUMSI: Menggunakan quick.db untuk json.sqlite
const db = require('quick.db');
// -------------------------------------

const { Client, GatewayIntentBits, Collection, Guild, EmbedBuilder } = require('discord.js');
const serverStatsCommand = require('./command/server-stats.js');
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
// --- BARIS DIHAPUS: client.afkUsers = new Collection(); ---
// Penyimpanan AFK sekarang menggunakan quick.db (json.sqlite)

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
  // --- =============================== ---

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

// ----------------------------------------------------------------------------------
// ------------------------ STRUCTURE AFK - UPDATE ----------------------------------
// ----------------------------------------------------------------------------------
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;
  const guildId = message.guild.id;
  const dbKey = `${guildId}_${userId}`;

  // --- Bagian A: Deteksi Kembali AFK (Auto-Return) ---
  const afkData = db.get(dbKey);

  if (afkData) {
    // 1. Hapus data AFK dari DB
    db.delete(dbKey);

    // 2. Kembalikan Nickname Asli
    const member = message.member;
    // Ambil nickname asli yang telah disimpan oleh afk.js
    const originalNickname = afkData.original_nickname;

    // Cek Nickname saat ini vs Nickname Asli
    if (member.nickname && member.nickname.startsWith('[AFK]')) {
      // Jika bot gagal mengembalikan nickname, ini biasanya karena role bot lebih rendah.
      await member.setNickname(originalNickname || null, 'Kembali dari AFK').catch(error => {
        console.error("Gagal balikin nickname:", error);
      });
    }

    // 3. Kirim pesan sambutan 
    const reply = await message.reply(`✅ Welcome back, ${message.author}! Status AFK Anda telah dihapus. `);

    // Hapus pesan balasan setelah 10 detik (seperti yang Anda lakukan)
    setTimeout(() => {
      reply.delete().catch(err => console.error("Gagal menghapus pesan 'welcome back':", err));
    }, 10000);
  }

  // --- Bagian B: Deteksi Mention AFK (Peringatan) ---
  message.mentions.users.forEach(mentionedUser => {
    const mentionedAfkKey = `${guildId}_${mentionedUser.id}`;
    const mentionedAfkData = db.get(mentionedAfkKey); // Cek di DB

    if (mentionedAfkData) {
      const reason = mentionedAfkData.reason;
      const timestamp = mentionedAfkData.afk_timestamp; // Diambil dari DB (Sistem AFK Baru)

      // Buat embed peringatan AFK yang rapi
      const afkWarningEmbed = new EmbedBuilder()
        .setColor('#FFC300') // Kuning
        .setDescription(`⚠️ **${mentionedUser.username}** lagi AFK!\n\n**Alasan:** ${reason}\n**AFK Sejak:** <t:${Math.floor(timestamp / 1000)}:R>`); // Format Waktu Relatif

      message.reply({ embeds: [afkWarningEmbed], ephemeral: false }).catch(console.error);
    }
  });
});

client.login(process.env.DISCORD_TOKEN);

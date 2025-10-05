const { Client, GatewayIntentBits, Collection } = require('discord.js');
const serverStatsCommand = require('./command/server-stats.js');
const autoChat = require('./auto-message/auto-chat.js');
const welcomer = require('./auto-message/welcomer.js');

//untoek slash command
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

const BOT_TOKEN = 'ISI-PAKE-TOKEN-BOT-LUWH'; // Ganti ini dengan token bot mu
// Langkah 1: Buat Collection untuk menyimpan perintah

client.commands = new Collection(); 
client.afkUsers = new Collection(); /// Menyimpan data AFK pengguna

client.commands.set(serverStatsCommand.data.name, serverStatsCommand);

// buat auto message
client.on('ready', () => {

   // --- KODE STATUS BOT DIMULAI DI SINI ---
    client.user.setPresence({
        activities: [{
            name: 'Kimir Impact', // Teks aktivitas
            type: 0 // Jenis aktivitas (0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 5 = Competing)
        }],
        status: 'idle' // idle, dnd, invisible
    });
    // --- KODE STATUS BOT SELESAI DI SINI --- 

  console.log(`logged in as ${client.user.tag}`);
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
    const reply = await message.reply('Welcome back! Status AFK luwh udah dihapus.');

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
      message.reply(`**${user.username}** lagi AFK\n **Alasan:** ${afkMentioned.reason}`);
    }
  });
});



client.login(BOT_TOKEN); // gausah di otak atik bagian ni

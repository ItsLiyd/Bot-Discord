const dotenv = require('dotenv');
dotenv.config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

// Ambil semua file .js langsung dari folder "command"
const commandsPath = path.join(__dirname, 'command');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`[WARNING] Perintah di ${filePath} tidak memiliki properti "data" atau "execute" yang dibutuhkan.`);
  }
}

// Buat instance REST - MENGGUNAKAN process.env.DISCORD_TOKEN
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Jalankan fungsi untuk mendaftarkan perintah
(async () => {
  try {
    console.log(`Mulai memuat ${commands.length} perintah aplikasi (/)`);

    // MENGGUNAKAN process.env.DISCORD_CLIENT_ID
    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );

    console.log(`Berhasil memuat ${data.length} perintah aplikasi (/)!`);
  } catch (error) {
    console.error(error);
  }
})();
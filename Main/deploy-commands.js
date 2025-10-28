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
    console.log(`[WARNING] Perintah di ${filePath} kaga punya properti "data" atau "execute" yang dibutuhin.`);
  }
}

// Buat instance REST - MENGGUNAKAN process.env.DISCORD_TOKEN
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Jalankan fungsi untuk mendaftarkan perintah
(async () => {
  try {
    console.log(`Mulai memuat ${commands.length} slash commands (/)`);

    // MENGGUNAKAN process.env.DISCORD_CLIENT_ID
    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );

    console.log(`Swelamoat! Kita berhasil memuat ${data.length} slash commands (/)!`);
  } catch (error) {
    console.error(error);
  }
})();

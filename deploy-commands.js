require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DEPLOY_GUILD_ID;

if (!token || !clientId) {
  console.error('Missing DISCORD_TOKEN atau DISCORD_CLIENT_ID di .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

// baca file command secara rekursif (mendukung subfolder)
function readCommandsRecursive(dir) {
  const commands = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      commands.push(...readCommandsRecursive(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        // hapus cache supaya perubahan file langsung terambil
        delete require.cache[require.resolve(full)];
        const cmd = require(full);
        if (cmd && cmd.data && typeof cmd.data.toJSON === 'function') {
          commands.push(cmd.data.toJSON());
          console.log(`Memuat command: ${cmd.data.name} -> ${full}`);
        } else {
          console.warn(`[SKIP] ${full} tidak mengekspor command valid (missing data.toJSON).`);
        }
      } catch (err) {
        console.error(`[ERROR] Gagal load file cik ${full}:`, err);
      }
    }
  }
  return commands;
}

const commandsPath = path.join(__dirname, 'command');
if (!fs.existsSync(commandsPath)) {
  console.error(`Commands directory ga ketemu: ${commandsPath}`);
  process.exit(1);
}

const commands = readCommandsRecursive(commandsPath);

(async () => {
  try {
    console.log(`Mempersiapkan untuk (re)register ${commands.length} command(s).`);
    if (commands.length === 0) {
      console.warn('Ga ada command ditemukan. Get Out 🔥.');
      process.exit(0);
    }

    if (guildId) {
      console.log(`Mendaftarkan command ke GUILD ${guildId} (propagasi cepat untuk testing).`);
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`Berhasil mendaftarkan ${data.length} command guild.`);
    } else {
      console.log('Mendaftarkan command global (propagasi bisa sampai 1 jam).');
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      console.log(`Berhasil mendaftarkan ${data.length} command global.`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Gagal mendaftarkan command:', error);
    process.exit(1);
  }
})();
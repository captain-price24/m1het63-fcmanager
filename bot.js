const { Client, Collection, ActivityType, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 1. Token ve Client ID'yi burada tanımlayın
const BOT_TOKEN = '';
const CLIENT_ID = ''; // Botunuzun client ID'si

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 2. Komutları yükle
client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }
}

// 3. Bot hazır olduğunda
client.once('ready', async () => {
  console.log(`${client.user.tag} giriş yaptı!`);

  // Slash komutlarını kaydet
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  try {
    console.log(`🔁 ${commands.length} slash komutu kaydediliyor...`);
    
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    
    console.log('✅ Slash komutları başarıyla kaydedildi!');
  } catch (error) {
    console.error('❌ Slash komut kaydı başarısız:', error);
  }

  // Bot durumunu ayarla
  client.user.setActivity('FC Manager Lig', { 
    type: ActivityType.Playing,
    url: 'https://discord.gg/WEMRnmY9V8'
  });
});

// Slash Command işleme
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction);
  }
});

// Prefix Command işleme
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith('!')) return;
  
  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (command) await command.execute(message, args);
});

// 6. Botu başlat
client.login(BOT_TOKEN);
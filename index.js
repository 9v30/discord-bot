// 必要モジュールを取得
const discord = require('discord.js');
const fs = require('fs');

// botの権限の設定
const client = new discord.Client({
  intents: Object.values(discord.GatewayIntentBits)
});

// botがログイン完了時に実行されるコード
client.once('ready', async() => {
  console.log(`Logged in as ${client.user.tag}`);
  await setCommand();
});

// コマンドデータの取得
const commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.data.name] = command;
}

//コマンドを登録
async function setCommand() {
  const data = []
  for (const commandName in commands) {
    data.push(commands[commandName].data)
  }
  await client.application.commands.set(data);
};

// コマンドの実行部分
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const command = commands[interaction.commandName];
  try {
    await command.execute(interaction, client, discord);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'コマンド実行中にエラーが発生しました。',
      ephemeral: true,
    })
  }
});

// イベントリスナーを登録
const listeners = fs.readdirSync('./listeners/').filter(file => file.endsWith('.js'));

for (const listener of listeners) {
  require(`./listeners/${listener}`)(client, discord);
}

// botをスタートさせる
client.login(process.env.TOKEN)